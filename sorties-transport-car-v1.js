(()=>{
'use strict';
if(window.__sortiesTransportCarV1)return;window.__sortiesTransportCarV1=true;
const STORE='horticulture-sorties-safe-v2';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let createState={transportMode:'individual',coachDepartureTime:'',coachDepartureLocation:''};
let editState={transportMode:'individual',coachDepartureTime:'',coachDepartureLocation:''};
let lastEditId='';
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function extra(s){try{return JSON.parse(String(s?.pricing||'{}'))||{}}catch(_){return{}}}
function currentSortie(){const title=$('#sortiesAdmin .sfs-detailMain h2')?.textContent?.trim()||'';return rows().find(x=>String(x.title||'').trim()===title)||null}
function style(){if($('#stcStyleV1'))return;const s=document.createElement('style');s.id='stcStyleV1';s.textContent=`.stc-box{border:1px solid #d6eadf;background:#f6fbf8;border-radius:14px;padding:13px;display:grid;gap:11px}.stc-head{display:flex;align-items:center;gap:9px;color:#07583f;font-weight:850}.stc-head svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.stc-fields{display:grid;grid-template-columns:.7fr 1.3fr;gap:9px}.stc-field{display:grid;gap:6px}.stc-field label{font-size:12px;font-weight:800}.stc-field input,.stc-field select{width:100%;border:1px solid #dce5df;border-radius:12px;padding:11px;background:#fff;font:inherit}.stc-note{font-size:11px;color:#62766d}.stc-hidden{display:none!important}@media(max-width:600px){.stc-fields{grid-template-columns:1fr}.stc-field input,.stc-field select{font-size:16px}}`;document.head.appendChild(s)}
const busIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M7 8h10M8 19v2m8-2v2"/></svg>';
function normalizeState(st){return{transportMode:st?.transportMode==='coach'?'coach':'individual',coachDepartureTime:String(st?.coachDepartureTime||''),coachDepartureLocation:String(st?.coachDepartureLocation||'')}}
function loadEditState(){const s=currentSortie();if(!s)return;const p=extra(s);if(String(s.id)!==String(lastEditId)){lastEditId=String(s.id);editState=normalizeState(p)}}
function renderFields(root,kind){const host=root.querySelector('.scw-section,.sew-section');if(!host||root.querySelector('[data-stc-box]'))return;const st=kind==='create'?createState:editState;const box=document.createElement('div');box.className='stc-box';box.dataset.stcBox=kind;box.innerHTML=`<div class="stc-head">${busIcon}<span>Transport jusqu’à la sortie</span></div><div class="stc-field"><label>Mode de transport</label><select data-stc-mode><option value="individual" ${st.transportMode!=='coach'?'selected':''}>Accès individuel</option><option value="coach" ${st.transportMode==='coach'?'selected':''}>Transport en car / bus organisé</option></select></div><div class="stc-fields ${st.transportMode==='coach'?'':'stc-hidden'}" data-stc-fields><div class="stc-field"><label>Heure de départ du car</label><input type="time" data-stc-time value="${esc(st.coachDepartureTime)}"></div><div class="stc-field"><label>Lieu de départ du car</label><input type="text" data-stc-location value="${esc(st.coachDepartureLocation)}" placeholder="Ex. Place de la Résistance, Châteaulin"></div></div><div class="stc-note">Si le car est activé, le PDF affichera ce rendez-vous à la place des accès voiture / train génériques.</div>`;
 host.appendChild(box);
 const mode=$('[data-stc-mode]',box),fields=$('[data-stc-fields]',box),time=$('[data-stc-time]',box),loc=$('[data-stc-location]',box);
 const save=()=>{st.transportMode=mode.value==='coach'?'coach':'individual';st.coachDepartureTime=time.value||'';st.coachDepartureLocation=loc.value.trim();fields.classList.toggle('stc-hidden',st.transportMode!=='coach')};
 mode.onchange=save;time.oninput=save;loc.oninput=save;
}
function enhance(){style();document.querySelectorAll('[data-scw]').forEach(root=>{if(/Dates et inscriptions/i.test(root.textContent||''))renderFields(root,'create')});document.querySelectorAll('[data-sew]').forEach(root=>{if(/Dates et inscriptions/i.test(root.textContent||'')){loadEditState();renderFields(root,'edit')}})}
function activeState(){if(document.querySelector('[data-sew]'))return editState;if(document.querySelector('[data-scw]'))return createState;return null}
function withTransport(sortie,st){if(!sortie||!st)return sortie;let p={};try{p=JSON.parse(String(sortie.pricing||'{}'))||{}}catch(_){p={}}p.transportMode=st.transportMode==='coach'?'coach':'individual';p.coachDepartureTime=String(st.coachDepartureTime||'');p.coachDepartureLocation=String(st.coachDepartureLocation||'');if(p.transportMode==='coach'){
 const bits=[];if(p.coachDepartureTime)bits.push('départ à '+p.coachDepartureTime.replace(':',' h '));if(p.coachDepartureLocation)bits.push('rendez-vous : '+p.coachDepartureLocation);
 p.accessInfo='Bus : Départ du car'+(bits.length?' — '+bits.join(' · '):' organisé par l’association.');
 }
 sortie.pricing=JSON.stringify(p);return sortie
}
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){try{if(init?.body&&typeof init.body==='string'){const body=JSON.parse(init.body),st=activeState();if(st&&(body.action==='saveSortieAdmin'||body.action==='createSortieHelloAsso')&&body.sortie){body.sortie=withTransport({...body.sortie},st);init={...init,body:JSON.stringify(body)}}}catch(_){}return nativeFetch(input,init)};
document.addEventListener('click',e=>{const bt=e.target.closest('[data-scw] [data-next], [data-sew] [data-next]');if(!bt)return;const root=bt.closest('[data-scw],[data-sew]'),box=root?.querySelector('[data-stc-box]');if(!box)return;const st=root.matches('[data-sew]')?editState:createState,mode=$('[data-stc-mode]',box),time=$('[data-stc-time]',box),loc=$('[data-stc-location]',box);st.transportMode=mode.value==='coach'?'coach':'individual';st.coachDepartureTime=time.value||'';st.coachDepartureLocation=loc.value.trim();if(st.transportMode==='coach'&&(!st.coachDepartureTime||!st.coachDepartureLocation)){e.preventDefault();e.stopImmediatePropagation();alert('Indiquez l’heure et le lieu de départ du car.')}} ,true);
document.addEventListener('click',e=>{const bt=e.target.closest('#sortiesAdmin [data-new]');if(bt)createState={transportMode:'individual',coachDepartureTime:'',coachDepartureLocation:''};const edit=e.target.closest('#sortiesAdmin button');if(edit&&/modifier/i.test((edit.textContent||'').trim())){lastEditId='';loadEditState()}},true);
const mo=new MutationObserver(()=>requestAnimationFrame(enhance));mo.observe(document.body,{childList:true,subtree:true});enhance();
})();