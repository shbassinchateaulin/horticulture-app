(()=>{
'use strict';
if(window.__sortiesPdfReportV2)return;window.__sortiesPdfReportV2=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rows(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(_){return[]}}
function current(){const t=$('#sortiesAdmin .sfs-detailMain h2')?.textContent?.trim()||'';return rows().find(s=>String(s.title||'').trim()===t)||null}
function extra(s){try{return JSON.parse(String(s?.pricing||'{}'))||{}}catch(_){return{}}}
function full(s){return Object.assign({},s||{},extra(s||{}))}
function statusMap(s){const o={};(s?.participants||[]).forEach(p=>o[p.id]=p.attendanceStatus||(p.present?'present':'pending'));try{Object.assign(o,JSON.parse(localStorage.getItem(CACHE)||'{}')[s.id]||{})}catch(_){}return o}
function label(x){return x==='present'?'Présent':x==='late'?'Retard':x==='absent'?'Absent':'À pointer'}
function fmtDate(v){if(!v)return'Non renseigné';try{return new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeStyle:'short'}).format(new Date(v))}catch(_){return String(v)}}
function fmtDay(v){if(!v)return'';try{return new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(v))}catch(_){return String(v)}}
function safeName(s){return String(s||'sortie').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'sortie'}
function loadJsPdf(){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve(window.jspdf.jsPDF);const x=document.createElement('script');x.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';x.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(Error('PDF indisponible'));x.onerror=()=>reject(Error('PDF indisponible'));document.head.appendChild(x)})}
async function imageData(url){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw 0;const b=await r.blob();return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(b)})}catch(_){return null}}
function lines(doc,t,w){return doc.splitTextToSize(String(t||''),w)}
function round(doc,x,y,w,h,fill=[255,255,255],stroke=[222,232,226],r=3){doc.setFillColor(...fill);doc.setDrawColor(...stroke);doc.roundedRect(x,y,w,h,r,r,'FD')}
function txt(doc,t,x,y,size=9,bold=false,color=[24,56,44]){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(String(t??''),x,y)}
function pill(doc,t,x,y,kind){const colors={present:[[228,246,235],[15,112,68]],late:[[255,241,216],[151,88,0]],absent:[[253,231,228],[172,45,35]],pending:[[239,243,240],[102,117,109]]};const c=colors[kind]||colors.pending;doc.setFont('helvetica','bold');doc.setFontSize(7.5);const w=Math.max(19,doc.getTextWidth(t)+7);doc.setFillColor(...c[0]);doc.setTextColor(...c[1]);doc.roundedRect(x,y-4.2,w,6.6,2.5,2.5,'F');doc.text(t,x+3.5,y);return w}
function footer(doc,page,total){doc.setFillColor(5,92,67);doc.rect(0,285,210,12,'F');txt(doc,"Société d’Horticulture et d’Art Floral du Bassin de Châteaulin",14,291,7,false,[255,255,255]);txt(doc,`Page ${page}/${total}`,196,291,7,true,[255,255,255]);doc.setTextColor(255,255,255);doc.text(String(`Page ${page}/${total}`),196-doc.getTextWidth(`Page ${page}/${total}`),291)}
async function build(raw){
 const jsPDF=await loadJsPdf(),s=full(raw),p=raw.participants||[],m=statusMap(raw),used=p.reduce((n,x)=>n+Math.max(1,Number(x.places||1)),0);
 const explicit=p.some(x=>x.presentAt||x.attendanceStatus&&x.attendanceStatus!=='pending')||Object.values(m).some(x=>['present','late','absent'].includes(x));
 const counts={present:0,late:0,absent:0};Object.values(m).forEach(v=>{if(counts[v]!==undefined)counts[v]++});
 const perPage=20,participantPages=Math.max(1,Math.ceil(p.length/perPage)),total=1+participantPages;
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
 const logo=await imageData(new URL('logo-admin-transparent.png',location.href).href);
 // PAGE 1
 if(logo)try{doc.addImage(logo,'PNG',12,10,19,19)}catch(_){}
 txt(doc,"Société d’Horticulture",35,15,9,true,[5,92,67]);txt(doc,"et d’Art Floral du Bassin",35,20,9,false,[5,92,67]);txt(doc,"de Châteaulin",35,25,9,false,[5,92,67]);
 txt(doc,s.title||'Sortie',104,17,22,true,[5,78,57]);const tw=doc.getTextWidth(String(s.title||'Sortie'));if(tw>88){doc.setFontSize(17);doc.text(String(s.title||'Sortie'),104,17,{maxWidth:92})}
 txt(doc,fmtDay(s.startDateTime||s.date),104,27,10,true,[5,92,67]);
 doc.setDrawColor(222,232,226);doc.line(12,34,198,34);
 // Stats banner adapts to digital/paper
 const sy=40,sh=25;if(explicit){const stats=[['Participants',String(used),'inscrits'],['Présents',String(counts.present),''],['Retards',String(counts.late),''],['Absents',String(counts.absent),'']];stats.forEach((a,i)=>{const x=12+i*46.5;round(doc,x,sy,44,sh,[255,255,255],[220,230,224],3);txt(doc,a[0],x+5,sy+7,8,false,[65,78,72]);txt(doc,a[1],x+5,sy+16,16,true,[5,92,67]);if(a[2])txt(doc,a[2],x+5,sy+21,7,false,[65,78,72])})}else{round(doc,12,sy,186,sh,[255,255,255],[220,230,224],3);txt(doc,'Participants',20,sy+8,9,false,[65,78,72]);txt(doc,String(used),20,sy+18,18,true,[5,92,67]);txt(doc,'inscrits',40,sy+18,8,false,[65,78,72]);txt(doc,'Appel prévu sur papier',130,sy+15,9,true,[95,109,102])}
 // Info/notes
 const y=71;round(doc,12,y,92,70,[255,255,255],[222,232,226],3);round(doc,108,y,90,70,[255,255,255],[222,232,226],3);
 txt(doc,'INFORMATIONS DE LA SORTIE',18,y+9,9,true,[5,92,67]);
 const info=[['Date',fmtDate(s.startDateTime||s.date)],['Fin',fmtDate(s.endDateTime)],['Lieu',s.location||'Non renseigné'],['Organisateur',s.organizer||s.organisateur||'Société d’Horticulture'],['Clôture',fmtDate(s.registrationEnd)]];let iy=y+18;info.forEach(([k,v])=>{txt(doc,k,18,iy,7.5,true,[5,92,67]);const ls=lines(doc,v,62);txt(doc,ls[0]||'',39,iy,7.5,false,[35,50,44]);iy+=7});
 if(s.description||s.notes){txt(doc,'Description',18,iy,7.5,true,[5,92,67]);const dl=lines(doc,s.description||s.notes,80).slice(0,3);doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(35,50,44);doc.text(dl,18,iy+5)}
 txt(doc,'NOTES / À PRÉVOIR',114,y+9,9,true,[5,92,67]);const note=String(s.notes||'Prévoir les informations utiles pour les participants.');const nl=lines(doc,note,76).slice(0,8);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(35,50,44);doc.text(nl,114,y+18);
 // Map + access
 const my=147;txt(doc,'ACCÈS AU LIEU',12,my,10,true,[5,92,67]);round(doc,12,my+5,82,115,[246,249,247],[222,232,226],3);round(doc,98,my+5,100,115,[255,255,255],[222,232,226],3);
 const lat=Number(s.locationLat),lng=Number(s.locationLng);let map=null;if(Number.isFinite(lat)&&Number.isFinite(lng)){map=await imageData(`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=13&size=600x520&markers=${lat},${lng},red-pushpin`)}
 if(map)try{doc.addImage(map,'PNG',15,my+8,76,61)}catch(_){map=null}
 if(!map){doc.setFillColor(234,241,237);doc.roundedRect(15,my+8,76,61,2,2,'F');txt(doc,'CARTE',45,my+34,12,true,[92,112,103]);const loc=lines(doc,s.location||'Adresse non renseignée',65).slice(0,2);doc.setFontSize(7);doc.setTextColor(92,112,103);doc.text(loc,20,my+43,{align:'left'})}
 txt(doc,s.location||'Lieu non renseigné',17,my+77,8,true,[5,92,67]);txt(doc,'Ouvrir dans votre application de navigation',17,my+84,7,false,[84,100,92]);
 txt(doc,'COMMENT Y ALLER',104,my+13,9,true,[5,92,67]);const access=String(s.accessInfo||'Accès non renseigné.').replace(/\r/g,'');const al=lines(doc,access,86).slice(0,19);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(35,50,44);doc.text(al,104,my+23);
 footer(doc,1,total);
 // PARTICIPANTS PAGES
 for(let pg=0;pg<participantPages;pg++){
  doc.addPage();const pageNo=pg+2;const subset=p.slice(pg*perPage,(pg+1)*perPage);
  if(logo)try{doc.addImage(logo,'PNG',12,10,13,13)}catch(_){}
  txt(doc,"Société d’Horticulture et d’Art Floral du Bassin de Châteaulin",29,15,7.8,true,[5,92,67]);txt(doc,'LISTE DES PARTICIPANTS',12,32,16,true,[5,78,57]);txt(doc,`${p.length} participant(s) · ${s.title||'Sortie'}`,12,39,8,false,[85,100,93]);
  const cols=explicit?[12,22,67,105,155,181]:[12,22,70,111,166,188];
  doc.setFillColor(237,246,241);doc.roundedRect(12,44,186,10,2,2,'F');const heads=explicit?['N°','Nom & prénom','Téléphone','E-mail','Source','Statut']:['N°','Nom & prénom','Téléphone','E-mail','Source','Présence'];heads.forEach((h,i)=>txt(doc,h,cols[i],50.5,7.5,true,[5,78,57]));
  let ry=59;subset.forEach((x,idx)=>{const global=pg*perPage+idx+1;if(idx%2===1){doc.setFillColor(249,251,250);doc.rect(12,ry-4.5,186,9,'F')}txt(doc,String(global),cols[0]+1,ry,7.2,false,[50,65,58]);const nm=[x.lastName,x.firstName].filter(Boolean).join(' ')||'—';txt(doc,(lines(doc,nm,42)[0]||nm),cols[1],ry,7.2,false,[28,48,39]);txt(doc,String(x.phone||'—'),cols[2],ry,7.2,false,[28,48,39]);txt(doc((()=>doc)()),String(x.email||'—'),cols[3],ry,7.2,false,[28,48,39]);
   ry+=0;
  });
  // redraw rows safely (previous compact line intentionally replaced below)
  ry=59;subset.forEach((x,idx)=>{const global=pg*perPage+idx+1;if(idx%2===1){doc.setFillColor(249,251,250);doc.rect(12,ry-4.5,186,9,'F')}txt(doc,String(global),cols[0]+1,ry,7.2,false,[50,65,58]);const nm=[x.lastName,x.firstName].filter(Boolean).join(' ')||'—';txt(doc,(lines(doc,nm,42)[0]||nm),cols[1],ry,7.2,false,[28,48,39]);txt(doc,(lines(doc,x.phone||'—',34)[0]||'—'),cols[2],ry,7.2,false,[28,48,39]);txt(doc,(lines(doc,x.email||'—',47)[0]||'—'),cols[3],ry,6.8,false,[28,48,39]);txt(doc,String(x.source||'—'),cols[4],ry,7,false,[28,48,39]);if(explicit){const st=m[x.id]||'pending';pill(doc,label(st),cols[5],ry,st)}else{doc.setDrawColor(80,100,90);doc.rect(cols[5]+1,ry-4.2,5,5)}doc.setDrawColor(231,237,233);doc.line(12,ry+4.5,198,ry+4.5);ry+=10.2});
  if(!subset.length)txt(doc,'Aucun participant inscrit',12,62,9,false,[95,108,101]);
  footer(doc,pageNo,total);
 }
 return {blob:doc.output('blob'),digital:explicit,total};
}
function preview(raw){if(!raw)return;const w=window.open('','_blank');if(!w){alert('Autorisez l’ouverture de la fenêtre pour afficher le PDF.');return}const s=full(raw);w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(s.title)} — PDF</title><style>*{box-sizing:border-box}body{margin:0;background:#f1f5f2;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17382c}.bar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid #dce6df;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;display:flex;gap:8px;align-items:center}.bar button{border:1px solid #d8e3dc;background:#fff;border-radius:11px;padding:10px 12px;font-weight:800;color:#17382c}.bar .main{margin-left:auto;background:#07583f;color:#fff;border-color:#07583f}.bar button:disabled{opacity:.45}.wrap{max-width:720px;margin:auto;padding:18px 14px 30px}.card{background:#fff;border:1px solid #dfe8e2;border-radius:18px;padding:20px}.card h1{font-size:23px;margin:0 0 8px;color:#07583f}.status{margin-top:14px;border-radius:12px;background:#edf6f1;padding:12px;font-weight:700;color:#176047}.hint{font-size:14px;line-height:1.5;color:#64746c}@media(max-width:520px){.bar{flex-wrap:wrap}.bar .main{margin-left:0;flex:1}.card{padding:16px}.wrap{padding:12px}}</style></head><body><div class="bar"><button id="back">← Retour</button><button id="open" disabled>Ouvrir</button><button class="main" id="share" disabled>Enregistrer / partager</button></div><div class="wrap"><div class="card"><h1>${esc(s.title||'Sortie')}</h1><div class="hint">Le document s’adapte automatiquement : si l’appel a été fait numériquement, les statuts apparaissent. Sinon, la liste est préparée pour l’appel papier avec des cases à cocher.</div><div class="status" id="st">Préparation du PDF…</div></div></div><script>document.getElementById('back').onclick=()=>{if(history.length>1)history.back();else window.close()};<\/script></body></html>`);w.document.close();
 build(raw).then(({blob,digital,total})=>{const url=URL.createObjectURL(blob),file=new File([blob],safeName(raw.title)+'.pdf',{type:'application/pdf'}),st=w.document.getElementById('st'),op=w.document.getElementById('open'),sh=w.document.getElementById('share');st.textContent=`PDF prêt · ${total} page(s) · ${digital?'appel numérique':'version papier'}`;op.disabled=false;sh.disabled=false;op.onclick=()=>w.location.href=url;sh.onclick=async()=>{try{if(w.navigator.share&&w.navigator.canShare?.({files:[file]})){await w.navigator.share({files:[file],title:String(raw.title||'Sortie')});return}const a=w.document.createElement('a');a.href=url;a.download=file.name;w.document.body.appendChild(a);a.click();a.remove()}catch(e){if(e?.name!=='AbortError')w.location.href=url}};setTimeout(()=>URL.revokeObjectURL(url),600000)}).catch(e=>{const st=w.document.getElementById('st');st.textContent='Impossible de préparer le PDF : '+(e.message||'erreur');st.style.color='#b42318'})}
document.addEventListener('click',e=>{const b=e.target.closest('#sortiesAdmin [data-sfx-pdf]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();preview(current())},true);
})();