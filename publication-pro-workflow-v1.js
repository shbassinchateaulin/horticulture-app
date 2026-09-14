(()=>{
'use strict';
if(window.__horticulturePublicationPolishV2)return;
window.__horticulturePublicationPolishV2=true;
const DRAFT='horticulture-publication-autosave-v4';
const $=(s,r=document)=>r.querySelector(s);
function read(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch(_){return null}}
function save(p){const d=read();if(!d)return;Object.assign(d,p,{updatedAt:new Date().toISOString()});localStorage.setItem(DRAFT,JSON.stringify(d))}
function css(){if($('#pubPolishV2'))return;const s=document.createElement('style');s.id='pubPolishV2';s.textContent=`
#publish.pubV4{max-width:980px!important}
#publish .p4Card{border:1px solid #e4ebe7!important;box-shadow:0 14px 40px rgba(18,51,37,.06)!important}
#publish .p4Hero img{display:none!important}
#publish .p4Hero{background:linear-gradient(145deg,#64795e,#4e654b)!important;height:190px!important}
#publish .p4Hero:after{display:none!important}
#publish .p4Hero h2{margin:0 0 42px!important;font-size:38px!important}
#publish .p4IndexImg,#publish .p4Gallery img{filter:saturate(1.035) contrast(1.02);object-fit:cover;object-position:center}
#publish .p4IndexImg{border-radius:12px!important;max-height:420px}
#publish .p4Gallery{gap:10px!important;margin:20px 0!important}
#publish .p4Gallery img{border-radius:12px!important}
#publish .p4Photos{gap:10px!important}
#publish .p4Photo,#publish .p4Add{border-radius:16px!important}
#publish .p4Add{background:#f7fbf8!important;border:1.5px dashed #b8cfc0!important}
#publish .p4Lead{max-width:700px}
#publish .p4Types{gap:12px!important}
#publish .p4Type{transition:.18s ease;box-shadow:0 4px 16px rgba(18,51,37,.025)}
#publish .p4Type.active{box-shadow:0 8px 24px rgba(7,88,63,.09)}
#publish .proPriceBox{border:1px solid #dce8e1;border-radius:18px;padding:15px;margin:15px 0;background:linear-gradient(180deg,#fbfdfb,#f5faf7)}
#publish .proPriceHead{display:flex;align-items:center;gap:10px;margin-bottom:11px}.proPriceIcon{width:38px;height:38px;border-radius:12px;background:#e7f3eb;color:#07583f;display:grid;place-items:center;font-weight:900}.proPriceHead b{display:block;font-size:13px}.proPriceHead small{display:block;color:#75837c;font-size:11px;margin-top:2px}
#publish .proPriceTabs{display:grid;grid-template-columns:1fr 1fr;gap:8px}.proPriceTabs button{border:1px solid #dce5df;background:#fff;border-radius:13px;padding:12px;font-weight:850;color:#54655c}.proPriceTabs button.active{border:2px solid #07583f;background:#edf7f1;color:#07583f}
#publish .proTarifs{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}.proTarifs label{font-size:11px;font-weight:800;color:#344b40}.proTarifs input{width:100%;margin-top:6px;border:1px solid #dce5df;border-radius:12px;padding:11px;background:#fff;font-size:15px}
#publish .proPhotoNotice{display:flex;gap:10px;padding:12px 13px;border-radius:14px;background:#f3f7f4;border:1px solid #e1e9e4;color:#57675e;font-size:11px;line-height:1.5;margin:10px 0 15px}.proPhotoNotice b{color:#244337}
#publish .proPreviewTools{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 10px}.proPreviewTools button{border:1px solid #d8e2dc;background:#fff;border-radius:11px;padding:9px 11px;font-size:11px;font-weight:800;color:#53665c}.proPreviewTools button.active{background:#07583f;color:#fff;border-color:#07583f}
#publish .proFull{position:fixed!important;inset:0!important;z-index:9999!important;background:#eef1ef!important;padding:18px!important;margin:0!important;overflow:auto!important;border-radius:0!important}.proFullClose{position:fixed;right:18px;top:18px;z-index:10001;border:0;border-radius:999px;background:#173126;color:#fff;width:42px;height:42px;font-size:22px;box-shadow:0 5px 20px #0003}.proDesktop .p4Phone{width:min(100%,940px)!important;border-radius:12px!important}.proDesktop .p4Body{padding:34px 52px 44px!important}.proDesktop .p4Body h1{font-size:36px!important}.proDesktop .p4Text{font-size:16px!important;line-height:1.72!important}
@media(max-width:800px){#publish.pubV4{padding-left:10px!important;padding-right:10px!important}.proTarifs{grid-template-columns:1fr}.proDesktop .p4Phone{width:900px!important;max-width:none!important}.proFull{padding:8px!important}.proFullClose{top:10px;right:10px}.p4Hero{height:150px!important}.p4Hero h2{font-size:31px!important;margin-bottom:33px!important}}
`;document.head.appendChild(s)}
function addPricing(){const root=$('#publish.pubV4'),d=read();if(!root||!d||d.type!=='sortie'||d.sourceMode!=='new'||Number(d.stage)!==1||root.querySelector('[data-pro-pricing]'))return;const fields=[...root.querySelectorAll('.p4Field')];const photoField=fields.find(x=>/photo/i.test(x.textContent||''));if(!photoField)return;const notice=document.createElement('div');notice.className='proPhotoNotice';notice.innerHTML='<span>▧</span><div><b>Photos de la publication</b><br>Ces images servent uniquement au contenu de la page. Gemini pourra choisir leur ordre et leur disposition. Elles ne deviennent pas une bannière.</div>';photoField.parentNode.insertBefore(notice,photoField);
const box=document.createElement('div');box.className='proPriceBox';box.dataset.proPricing='1';const mode=d.pricingMode||'free';box.innerHTML=`<div class="proPriceHead"><div class="proPriceIcon">€</div><div><b>Inscription HelloAsso</b><small>Ces informations serviront au copier-coller manuel.</small></div></div><div class="proPriceTabs"><button type="button" data-pmode="free" class="${mode==='free'?'active':''}">Gratuite</button><button type="button" data-pmode="paid" class="${mode==='paid'?'active':''}">Payante</button></div><div class="proTarifs" style="display:${mode==='paid'?'grid':'none'}"><label>Tarif adhérent<input type="number" min="0" step="0.5" data-member value="${d.memberPrice||''}" placeholder="0,00"></label><label>Tarif non-adhérent<input type="number" min="0" step="0.5" data-nonmember value="${d.nonMemberPrice||''}" placeholder="0,00"></label></div>`;photoField.parentNode.insertBefore(box,notice);box.querySelectorAll('[data-pmode]').forEach(b=>b.onclick=()=>{const m=b.dataset.pmode;save({pricingMode:m,priceText:m==='free'?'Gratuit':''});root.querySelectorAll('[data-pmode]').forEach(x=>x.classList.toggle('active',x.dataset.pmode===m));box.querySelector('.proTarifs').style.display=m==='paid'?'grid':'none'});const update=()=>{const a=Number(box.querySelector('[data-member]')?.value||0),n=Number(box.querySelector('[data-nonmember]')?.value||0);save({memberPrice:a,nonMemberPrice:n,pricingMode:'paid',priceText:`Adhérent : ${a} € — Non-adhérent : ${n} €`})};box.querySelector('[data-member]')?.addEventListener('input',update);box.querySelector('[data-nonmember]')?.addEventListener('input',update)}
function previewTools(){const root=$('#publish.pubV4'),d=read();if(!root||!d||![3,4].includes(Number(d.stage)))return;const wrap=$('.p4SiteWrap',root);if(!wrap||wrap.dataset.proTools==='1')return;wrap.dataset.proTools='1';const tools=document.createElement('div');tools.className='proPreviewTools';tools.innerHTML='<button type="button" data-vp="phone" class="active">Téléphone</button><button type="button" data-vp="desktop">Ordinateur</button><button type="button" data-full>Plein écran</button>';wrap.parentNode.insertBefore(tools,wrap);const setVp=v=>{root.classList.toggle('proDesktop',v==='desktop');tools.querySelectorAll('[data-vp]').forEach(b=>b.classList.toggle('active',b.dataset.vp===v))};tools.querySelectorAll('[data-vp]').forEach(b=>b.onclick=()=>setVp(b.dataset.vp));tools.querySelector('[data-full]').onclick=()=>{wrap.classList.add('proFull');const close=document.createElement('button');close.className='proFullClose';close.textContent='×';close.onclick=()=>{wrap.classList.remove('proFull');close.remove()};document.body.appendChild(close)}}
function cleanupLegacy(){const root=$('#publish.pubV4');if(!root)return;root.querySelectorAll('.proHaShell,[data-pro-ha]').forEach(x=>x.remove())}
function refresh(){css();cleanupLegacy();addPricing();previewTools()}
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(refresh,25)}).observe(document.documentElement,{subtree:true,childList:true});refresh();
})();