(()=>{
'use strict';
if(window.__sortiesUiSimpleV2)return;window.__sortiesUiSimpleV2=true;
function css(){if(document.getElementById('sortiesUiSimpleStyleV2'))return;const s=document.createElement('style');s.id='sortiesUiSimpleStyleV2';s.textContent=`
#sortiesAdmin .sfs-btn{min-height:44px;border-radius:13px;font-size:14px}
#sortiesAdmin .sfs-tools{gap:10px}
#sortiesAdmin .sfs-tools [data-attendance],#sortiesAdmin .sfs-tools [data-scan]{font-size:15px;padding:12px 16px}
#sortiesAdmin .sfs-tools [data-scan]{background:#07583f;color:#fff;border-color:#07583f}
#sortiesAdmin .sfs-toolbar{gap:10px}
#sortiesAdmin [data-import]{background:#f3f8f5;border-color:#d7e7dd;color:#07583f}
#sortiesAdmin .sfs-detailHead .sfs-sub{font-size:13px;line-height:1.45}
#sortiesAdmin .sfs-subtabs{gap:20px;overflow-x:auto;white-space:nowrap}
#sortiesAdmin .sfs-tab{min-height:46px}
#sortiesAdmin .sfs-row{cursor:pointer}
#sortiesAdmin .sfs-row:active{background:#f5f8f6}
.sxe-choice svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:700px){#sortiesAdmin .sfs-tools{display:grid;grid-template-columns:1fr 1fr}#sortiesAdmin .sfs-tools [data-attendance],#sortiesAdmin .sfs-tools [data-scan]{min-height:54px}#sortiesAdmin .sfs-toolbar{display:grid;grid-template-columns:1fr 1fr}#sortiesAdmin .sfs-toolbar .sfs-search{grid-column:1/-1;max-width:none;width:100%}#sortiesAdmin [data-add-person],#sortiesAdmin [data-import]{min-height:50px}#sortiesAdmin .sfs-head h1{font-size:26px}}
`;document.head.appendChild(s)}
function simplify(){css();const root=document.getElementById('sortiesAdmin');if(!root)return;const scan=root.querySelector('[data-scan]');if(scan&&!scan.dataset.simpleDone){scan.dataset.simpleDone='1';scan.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z"/></svg> Scanner'}const att=root.querySelector('[data-attendance]');if(att&&!att.dataset.simpleDone){att.dataset.simpleDone='1';att.textContent='✓ Faire l’appel'}const imp=root.querySelector('[data-import]');if(imp&&!imp.dataset.simpleDone){imp.dataset.simpleDone='1';imp.textContent='Importer une liste'}}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;simplify()})}
const root=document.getElementById('sortiesAdmin');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});else{const boot=new MutationObserver(()=>{const r=document.getElementById('sortiesAdmin');if(!r)return;boot.disconnect();new MutationObserver(schedule).observe(r,{childList:true,subtree:true});schedule()});boot.observe(document.body,{childList:true,subtree:true})}simplify();
})();