(()=>{
'use strict';
if(window.__horticultureHelloAssoCopilotV1)return;
window.__horticultureHelloAssoCopilotV1=true;
const DRAFT='horticulture-publication-autosave-v4';
const HELLO_URL='https://admin.helloasso.com/societe-d-horticulture-du-bassin-de-chateaulin/evenements/creation';
const $=(s,r=document)=>r.querySelector(s);
function draft(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch(_){return null}}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
function clip(s,n){s=clean(s);return n&&s.length>n?s.slice(0,n-1).trim()+'…':s}
function fmtDate(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return new Intl.DateTimeFormat('fr-FR',{dateStyle:'short'}).format(d)}
function fmtTime(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime())){const m=String(v).match(/(\d{2}:\d{2})/);return m?m[1]:''}return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function derived(d){
 const title=clean(d.generatedTitle||d.title||'');
 const long=clean(d.generatedText||d.text||d.description||'');
 const short=clip(long||title,500);
 const start=d.date||d.startDateTime||'';
 const end=d.endDateTime||'';
 const oneDay=!end||fmtDate(start)===fmtDate(end);
 const paid=(d.pricingMode||'free')==='paid';
 const thank=clean(d.thankYou||`Merci pour votre inscription à ${title||'cet événement'}. Nous avons hâte de vous retrouver. Vous recevrez les informations utiles avant la sortie.`);
 return [
  ['Nom de la campagne',clip(title,80)],
  ['Type de campagne','Événement'],
  ['Durée',oneDay?'Sur une journée':'Sur plusieurs jours'],
  ['Date de l’événement',fmtDate(start)],
  ['Heure de début',fmtTime(start)],
  ['Heure de fin',fmtTime(end)||'23:59'],
  ['Lieu de l’événement',clean(d.location||'')],
  ['Adresse postale',clean(d.address||d.postalAddress||'')],
  ['Email de l’organisateur',clean(d.organizerEmail||'')],
  ['Téléphone de l’organisateur',clean(d.organizerPhone||'')],
  ['En quelques mots',short],
  ['Description longue',long],
  ['Couleur principale','#07583f'],
  ['Message de remerciements',thank],
  ['Inscription',paid?'Payante':'Gratuite'],
  ...(paid?[["Tarif adhérent",`${Number(d.memberPrice||0).toFixed(2).replace('.',',')} €`],["Tarif non-adhérent",`${Number(d.nonMemberPrice||0).toFixed(2).replace('.',',')} €`]]:[]),
  ['Capacité',d.capacity?String(d.capacity):'']
 ];
}
async function copyText(text,btn){if(!text)return;try{await navigator.clipboard.writeText(text)}catch(_){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}const old=btn.textContent;btn.textContent='Copié';btn.classList.add('done');setTimeout(()=>{btn.textContent=old;btn.classList.remove('done')},900)}
function openSide(){
 const mobile=matchMedia('(max-width:800px)').matches;
 if(mobile){window.open(HELLO_URL,'_blank','noopener');return}
 const aw=window.screen.availWidth||screen.width,ah=window.screen.availHeight||screen.height,w=Math.max(620,Math.floor(aw*.5)),h=Math.max(700,ah-80),left=Math.max(0,aw-w);
 const win=window.open(HELLO_URL,'helloasso-create',`popup=yes,width=${w},height=${h},left=${left},top=20,resizable=yes,scrollbars=yes`);
 try{win?.focus()}catch(_){ }
}
function css(){if($('#haCopilotStyle'))return;const s=document.createElement('style');s.id='haCopilotStyle';s.textContent=`
#publish .haCopilot{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px;align-items:start;margin-top:14px}.haCopilotLeft{display:grid;gap:10px}.haField{border:1px solid #dfe8e3;border-radius:14px;background:#fff;padding:12px}.haFieldTop{display:flex;align-items:center;gap:10px;margin-bottom:7px}.haFieldTop b{flex:1;font-size:12px;color:#14392c}.haCopy{border:1px solid #cbdcd2;background:#f7fbf8;color:#07583f;border-radius:9px;padding:7px 9px;font-size:11px;font-weight:850}.haCopy.done{background:#07583f;color:#fff}.haValue{font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:#22342c}.haValue.empty{color:#98a39d;font-style:italic}.haCopilotRight{position:sticky;top:12px;border:1px solid #dce6e0;border-radius:18px;background:#f7faf8;padding:16px}.haCopilotRight h3{margin:0 0 6px;color:#15392d}.haCopilotRight p{margin:0 0 12px;font-size:12px;line-height:1.5;color:#68786f}.haOpen{width:100%;border:0;background:#07583f;color:#fff;border-radius:13px;padding:13px;font-weight:900}.haNote{font-size:11px;color:#78877f;margin-top:10px;line-height:1.45}.haAiBadge{display:inline-flex;gap:6px;align-items:center;border-radius:999px;padding:6px 9px;background:#eef7f2;color:#07583f;font-size:10px;font-weight:850;margin-bottom:10px}.haImageTip{margin-top:12px;padding:10px;border-radius:12px;background:#fff;border:1px solid #e2e9e5;font-size:11px;line-height:1.45;color:#53645b}
@media(max-width:850px){#publish .haCopilot{grid-template-columns:1fr}.haCopilotRight{position:static;order:-1}.haField{padding:11px}.haValue{font-size:12px}}
`;document.head.appendChild(s)}
function render(){css();const root=$('#publish.pubV4');const d=draft();if(!root||!d||d.type!=='sortie'||Number(d.stage)!==35)return;const old=root.querySelector('[data-ha-copilot]');if(old)return;const anchor=root.querySelector('.proHaShell')||root.querySelector('.p4CopyGrid');if(!anchor)return;
 if(anchor.classList.contains('proHaShell'))anchor.style.display='none';
 const wrap=document.createElement('section');wrap.className='haCopilot';wrap.dataset.haCopilot='1';const left=document.createElement('div');left.className='haCopilotLeft';derived(d).forEach(([label,val])=>{const c=document.createElement('div');c.className='haField';c.innerHTML=`<div class="haFieldTop"><b>${label}</b><button type="button" class="haCopy">Copier</button></div><div class="haValue ${val?'':'empty'}"></div>`;const v=c.querySelector('.haValue');v.textContent=val||'À compléter';c.querySelector('.haCopy').onclick=e=>copyText(val,e.currentTarget);if(!val)c.querySelector('.haCopy').disabled=true;left.appendChild(c)});
 const right=document.createElement('aside');right.className='haCopilotRight';right.innerHTML=`<div class="haAiBadge">Préparé par Gemini</div><h3>Création HelloAsso</h3><p>Les contenus préparés par l’IA sont prêts à copier. Ouvre la vraie page HelloAsso à côté puis colle chaque champ.</p><button type="button" class="haOpen">Ouvrir HelloAsso à droite</button><div class="haImageTip"><b>Bannière / vignette</b><br>Utilise la photo principale sélectionnée par l’IA. L’app conserve les autres photos pour la publication Google Sites.</div><div class="haNote">HelloAsso bloque son interface admin dans une iframe. Cette fenêtre côte à côte est donc la solution la plus proche d’un écran unique tout en gardant la vraie interface HelloAsso.</div>`;right.querySelector('.haOpen').onclick=openSide;wrap.append(left,right);anchor.insertAdjacentElement('afterend',wrap)}
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(render,30)}).observe(document.documentElement,{subtree:true,childList:true});render();
})();