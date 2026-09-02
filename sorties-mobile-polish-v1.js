(()=>{
'use strict';
if(window.__sortiesMobilePolishV1)return;window.__sortiesMobilePolishV1=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#sortiesMobilePolishStyle'))return;const st=document.createElement('style');st.id='sortiesMobilePolishStyle';st.textContent=`
#sortiesAdmin .sfx-detailDelete{margin-left:auto!important;order:90!important}#sortiesAdmin .sfs-tools [data-scan]{order:91!important}
@media(max-width:700px){
#sortiesAdmin .sfs-tableWrap{overflow:visible!important;padding:0 12px 14px!important}
#sortiesAdmin .sfs-table{display:block!important;width:100%!important;min-width:0!important;border-collapse:separate!important}
#sortiesAdmin .sfs-table thead{display:none!important}
#sortiesAdmin .sfs-table tbody{display:grid!important;gap:10px!important;width:100%!important}
#sortiesAdmin .sfs-table tr{display:block!important;width:100%!important;border:1px solid #e2e9e5!important;border-radius:15px!important;background:#fff!important;padding:11px 12px!important;box-shadow:0 1px 0 rgba(8,47,34,.02)!important}
#sortiesAdmin .sfs-table td{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;width:100%!important;min-width:0!important;border:0!important;border-bottom:1px solid #edf1ef!important;padding:7px 0!important;font-size:13px!important;text-align:right!important;white-space:normal!important;overflow:visible!important}
#sortiesAdmin .sfs-table td:last-child{border-bottom:0!important;padding-bottom:1px!important}
#sortiesAdmin .sfs-table td::before{content:attr(data-mobile-label);flex:0 0 38%;text-align:left;color:#7a8781;font-size:11px;font-weight:750!important}
#sortiesAdmin .sfs-table td[data-mobile-name="1"]{display:block!important;text-align:left!important;padding:2px 0 9px!important;font-size:16px!important;font-weight:850!important;color:#17382c!important}
#sortiesAdmin .sfs-table td[data-mobile-name="1"]::before{display:none!important}
#sortiesAdmin .sfs-table td[data-mobile-actions="1"]{justify-content:flex-end!important;gap:8px!important;padding-top:9px!important}
#sortiesAdmin .sfs-table td[data-mobile-actions="1"]::before{margin-right:auto!important}
#sortiesAdmin .sfs-table td button{max-width:100%!important;flex:0 0 auto!important}
#sortiesAdmin .sfs-tools{align-items:center!important}
#sortiesAdmin .sfx-detailDelete{margin-left:auto!important;justify-self:end!important}
}
`;document.head.appendChild(st)}
function removeWrongListDeletes(){$$('#sortiesAdmin [data-sfx-list-delete]').forEach(x=>x.remove())}
function placeDetailDelete(){const root=$('#sortiesAdmin'),tools=$('.sfs-tools',root),del=$('[data-sfx-detail-delete]',root),scan=$('[data-scan]',root);if(!tools||!del)return;if(del.parentElement!==tools)tools.appendChild(del);del.style.marginLeft='auto';if(scan&&scan.parentElement===tools&&del.nextElementSibling!==scan)tools.insertBefore(del,scan)}
function optimizeParticipants(){const table=$('#sortiesAdmin .sfs-table');if(!table)return;const heads=$$('thead th',table).map(x=>(x.textContent||'').trim());$$('tbody tr',table).forEach(tr=>{$$('td',tr).forEach((td,i)=>{const label=heads[i]||'';td.dataset.mobileLabel=label||'Information';if(i===0||/nom|prénom/i.test(label))td.dataset.mobileName='1';else delete td.dataset.mobileName;if(/action|option|gestion/i.test(label)||td.querySelector('button'))td.dataset.mobileActions='1';else delete td.dataset.mobileActions})})}
let pending=false;function run(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;css();removeWrongListDeletes();placeDetailDelete();optimizeParticipants()})}
new MutationObserver(run).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(run,0),true);document.addEventListener('horticulture-sorties-shared-updated',run);css();run();
})();