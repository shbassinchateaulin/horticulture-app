(()=>{
'use strict';
if(window.__sortiesMobilePolishV3)return;window.__sortiesMobilePolishV3=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let mobileQuery='';
function isMobile(){return matchMedia('(max-width:700px)').matches}
function css(){let st=$('#sortiesMobilePolishStyle');if(!st){st=document.createElement('style');st.id='sortiesMobilePolishStyle';document.head.appendChild(st)}st.textContent=`
#sortiesAdmin .sfx-detailDelete{margin-left:auto!important;order:90!important}#sortiesAdmin .sfs-tools [data-scan]{order:91!important}
[data-sfx-cleanmenu]{justify-content:flex-start!important;text-align:left!important;width:100%!important}[data-sfx-cleanmenu] .sfx-icon{margin-right:8px!important;flex:0 0 15px!important}
@media(max-width:700px){
#sortiesAdmin .sfs-tableWrap{overflow:visible!important;padding:0 10px 14px!important}
#sortiesAdmin .sfs-table{display:block!important;width:100%!important;min-width:0!important;border-collapse:separate!important}
#sortiesAdmin .sfs-table thead{display:none!important}
#sortiesAdmin .sfs-table tbody{display:grid!important;gap:8px!important;width:100%!important}
#sortiesAdmin .sfs-table tr{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;width:100%!important;border:1px solid #e2e9e5!important;border-radius:14px!important;background:#fff!important;padding:11px 12px!important;box-shadow:0 1px 0 rgba(8,47,34,.02)!important}
#sortiesAdmin .sfs-table td{display:none!important;border:0!important;padding:0!important;min-width:0!important;white-space:normal!important;overflow:visible!important}
#sortiesAdmin .sfs-table td[data-mobile-name="1"]{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;grid-column:1 / -1!important;text-align:left!important;font-size:16px!important;font-weight:850!important;color:#17382c!important}
#sortiesAdmin .sfs-table td[data-mobile-name="1"]::before{display:none!important}
#sortiesAdmin .sfs-table td[data-mobile-phone="1"]{display:block!important;grid-column:1!important;margin-top:5px!important;color:#617169!important;font-size:13px!important;text-align:left!important}
#sortiesAdmin .sfs-table td[data-mobile-phone="1"]::before{display:none!important}
#sortiesAdmin .sfs-table td[data-mobile-presence="1"]{display:block!important;grid-column:2!important;grid-row:2!important;margin-top:5px!important;text-align:right!important;font-size:12px!important}
#sortiesAdmin .sfs-table td[data-mobile-presence="1"]::before{display:none!important}
#sortiesAdmin .sfs-table td[data-mobile-actions="1"]{display:flex!important;grid-column:1 / -1!important;justify-content:flex-start!important;align-items:center!important;flex-wrap:wrap!important;gap:7px!important;margin-top:9px!important;padding-top:9px!important;border-top:1px solid #edf1ef!important;text-align:left!important}
#sortiesAdmin .sfs-table td[data-mobile-actions="1"]::before{display:none!important}
#sortiesAdmin .sfs-table tr.mobile-expanded td[data-mobile-secondary="1"]{display:flex!important;grid-column:1 / -1!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:6px 0!important;border-top:1px solid #f0f3f1!important;font-size:12px!important;text-align:right!important}
#sortiesAdmin .sfs-table tr.mobile-expanded td[data-mobile-secondary="1"]::before{content:attr(data-mobile-label);display:block!important;color:#7a8781;font-size:11px;font-weight:750!important;text-align:left!important}
#sortiesAdmin .sfs-table td[data-mobile-actions="1"] button{min-height:36px!important;padding:7px 10px!important;margin:0!important}
#sortiesAdmin .sfx-moreInfo{width:30px!important;height:30px!important;min-width:30px!important;padding:0!important;border:1px solid #dce5df!important;border-radius:50%!important;background:#f7faf8!important;color:#07583f!important;font-size:19px!important;font-weight:500!important;line-height:1!important;display:grid!important;place-items:center!important;box-shadow:none!important}
#sortiesAdmin .sfs-tools{align-items:center!important}#sortiesAdmin .sfx-detailDelete{margin-left:auto!important;justify-self:end!important}
[data-sfx-cleanmenu]{min-height:42px!important;border-radius:10px!important;padding:9px 11px!important;justify-content:flex-start!important}
}
`}
function placeDetailDelete(){const root=$('#sortiesAdmin'),tools=$('.sfs-tools',root),del=$('[data-sfx-detail-delete]',root),scan=$('[data-scan]',root);if(!tools||!del)return;if(del.parentElement!==tools)tools.appendChild(del);del.style.marginLeft='auto';if(scan&&scan.parentElement===tools&&del.nextElementSibling!==scan)tools.insertBefore(del,scan)}
function classify(label,i,td){const l=label.toLowerCase();if(i===0||/nom|prénom/.test(l))return'name';if(/téléphone|telephone|tel\b/.test(l))return'phone';if(/présence|presence|statut/.test(l))return'presence';if(/action|option|gestion/.test(l)||td.querySelector('button'))return'actions';return'secondary'}
function optimizeParticipants(){const table=$('#sortiesAdmin .sfs-table');if(!table)return;const heads=$$('thead th',table).map(x=>(x.textContent||'').trim());$$('tbody tr',table).forEach(tr=>{$$('td',tr).forEach((td,i)=>{const label=heads[i]||'';td.dataset.mobileLabel=label||'Information';delete td.dataset.mobileName;delete td.dataset.mobilePhone;delete td.dataset.mobilePresence;delete td.dataset.mobileActions;delete td.dataset.mobileSecondary;const type=classify(label,i,td);if(type==='name'){td.dataset.mobileName='1';if(!$('.sfx-moreInfo',td)){const b=document.createElement('button');b.type='button';b.className='sfx-moreInfo';b.setAttribute('aria-label','Afficher plus d’informations');b.textContent='+';b.onclick=e=>{e.preventDefault();e.stopPropagation();const open=tr.classList.toggle('mobile-expanded');b.textContent=open?'−':'+';b.setAttribute('aria-label',open?'Masquer les informations':'Afficher plus d’informations')};td.appendChild(b)}}else if(type==='phone')td.dataset.mobilePhone='1';else if(type==='presence')td.dataset.mobilePresence='1';else if(type==='actions')td.dataset.mobileActions='1';else td.dataset.mobileSecondary='1'})});applySearch()}
function applySearch(){if(!isMobile())return;const q=mobileQuery.trim().toLocaleLowerCase('fr');const table=$('#sortiesAdmin .sfs-table');if(!table)return;$$('tbody tr',table).forEach(tr=>{const txt=(tr.textContent||'').toLocaleLowerCase('fr');tr.style.display=!q||txt.includes(q)?'grid':'none'})}
function installSearchFix(){const input=$('#sortiesAdmin .sfs-search');if(!input||input.dataset.mobileSearchFixed)return;input.dataset.mobileSearchFixed='1';input.addEventListener('input',e=>{if(!isMobile())return;e.stopImmediatePropagation();mobileQuery=input.value;applySearch()},true);input.addEventListener('search',e=>{if(!isMobile())return;e.stopImmediatePropagation();mobileQuery=input.value;applySearch()},true)}
let pending=false;function run(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;css();placeDetailDelete();optimizeParticipants();installSearchFix()})}
new MutationObserver(run).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(run,0),true);document.addEventListener('horticulture-sorties-shared-updated',run);addEventListener('resize',run);css();run();
})();