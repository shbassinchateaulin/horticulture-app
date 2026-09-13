(()=>{
'use strict';
if(window.__publicationMobilePolishV1)return;window.__publicationMobilePolishV1=true;
const s=document.createElement('style');s.id='publicationMobilePolishV1Style';s.textContent=`
#publish.pubFlow{--pg:#07583f;--soft:#f3f8f5;--line:#e6ece8;--ink:#16271f;--muted:#6f7d76;background:transparent}
#publish .pubBack{font-size:14px;padding:8px 2px 12px}
#publish .pubHead{margin-bottom:10px}#publish .pubHead h1{font-size:32px;letter-spacing:-1px;color:var(--ink)}#publish .pubSub{font-size:13px;line-height:1.45;max-width:620px}
#publish .pubSteps{position:relative;display:flex;gap:0;margin:18px 2px 24px;padding:0}
#publish .pubStep{position:relative;flex:1;border:0;background:transparent!important;box-shadow:none!important;padding:27px 3px 0;font-size:10px;color:#93a099}
#publish .pubStep:before{content:'';position:absolute;top:4px;left:50%;width:18px;height:18px;transform:translateX(-50%);border-radius:50%;background:#dce4df;border:4px solid #fff;box-shadow:0 0 0 1px #dce4df;z-index:2}
#publish .pubStep:after{content:'';position:absolute;height:2px;background:#dce4df;top:13px;left:-50%;right:50%;z-index:1}#publish .pubStep:first-child:after{display:none}
#publish .pubStep.on{color:var(--pg)}#publish .pubStep.on:before{background:var(--pg);box-shadow:0 0 0 1px var(--pg)}#publish .pubStep.on:after{background:var(--pg)}
#publish .pubStep.current:before{box-shadow:0 0 0 1px var(--pg),0 0 0 5px #e5f2e9}
#publish .pubType{gap:12px}#publish .pubTypeBtn{min-height:94px;border:1px solid var(--line);border-radius:22px;padding:17px;background:#fff;box-shadow:0 8px 24px rgba(19,53,39,.05);transition:.18s transform,.18s border-color,.18s box-shadow}
#publish .pubTypeBtn:active{transform:scale(.985)}#publish .pubTypeBtn.active{border:1.5px solid var(--pg);background:linear-gradient(145deg,#fff,#f1f8f4);box-shadow:0 10px 26px rgba(7,88,63,.09)}
#publish .pubTypeIcon{width:48px;height:48px;border-radius:15px;font-size:21px;background:#e8f4ec}#publish .pubTypeBtn b{font-size:16px;color:var(--ink)}#publish .pubTypeBtn small{font-size:12px;line-height:1.35}
#publish .pubCard{border:0;border-radius:24px;padding:22px;background:#fff;box-shadow:0 10px 35px rgba(21,48,37,.07)}#publish .pubCard h2{font-size:21px;letter-spacing:-.35px;color:var(--ink)}#publish .pubLead{font-size:13px;line-height:1.5;margin:5px 0 20px}
#publish .pubField{gap:7px;margin:16px 0}#publish .pubField label{font-size:12px;color:#3d5047}#publish .pubField input,#publish .pubField textarea,#publish .pubField select{border:1px solid #dfe7e2;border-radius:15px;padding:14px 15px;background:#fbfcfb;outline:none;transition:.18s}
#publish .pubField input:focus,#publish .pubField textarea:focus,#publish .pubField select:focus{border-color:#78a991;background:#fff;box-shadow:0 0 0 4px #eaf4ee}#publish .pubField textarea{min-height:150px}
#publish .pubChoice{gap:10px}#publish .pubChoice button{border:1px solid var(--line);border-radius:17px;padding:15px;background:#fbfcfb}#publish .pubChoice button.active{border:1.5px solid var(--pg);background:#eff7f2}
#publish .pubNote{border:0;background:#eef7f1;border-radius:16px;padding:14px 15px}#publish .pubAuto{justify-content:center;margin:15px 0 2px;color:#77857e}
#publish .pubBtn{min-height:46px;border-radius:14px;padding:12px 16px}#publish .pubBtn.primary{box-shadow:0 8px 20px rgba(7,88,63,.2)}
#publish .pubPreviewShell{background:#dfe5e1;border-radius:28px;padding:12px}#publish .pubBrowser{border:0;border-radius:20px;box-shadow:0 18px 45px rgba(15,42,31,.16)}#publish .pubBrowserTop{background:#f5f6f5}#publish .pubPreviewBody{padding:22px}#publish .pubHero{border-radius:18px;height:250px}#publish .pubPreviewBody h3{font-size:28px;line-height:1.1;letter-spacing:-.6px}
#publish .pubGallery img{border-radius:13px}#publish .pubHello{border-radius:13px;text-decoration:none}
@media(max-width:800px){
 #publish.pubFlow{padding:2px 12px 112px!important;margin:0!important;max-width:none!important}
 #publish .pubBack{padding-left:1px;margin-bottom:2px}#publish .pubHead h1{font-size:30px}#publish .pubSub{font-size:12.5px;margin-top:5px}
 #publish .pubSteps{margin:16px 4px 22px}#publish .pubStep{font-size:9.5px;padding-top:28px}#publish .pubStep span{display:inline!important}#publish .pubStep:before{width:16px;height:16px;top:5px}#publish .pubStep:after{top:13px}
 #publish .pubType{grid-template-columns:1fr 1fr!important;gap:9px;margin-bottom:13px}#publish .pubTypeBtn{display:block;min-height:132px;padding:14px;border-radius:20px}#publish .pubTypeIcon{width:42px;height:42px;margin-bottom:12px}#publish .pubTypeBtn b{font-size:15px}#publish .pubTypeBtn small{font-size:10.5px;margin-top:5px}
 #publish .pubCard{padding:18px 16px;border-radius:22px;box-shadow:0 8px 28px rgba(21,48,37,.065)}#publish .pubCard h2{font-size:20px}#publish .pubLead{margin-bottom:16px}
 #publish .pubGrid2,#publish .pubChoice,#publish .pubCopyGrid,#publish .pubHelloStage,#publish .pubEditGrid{grid-template-columns:1fr!important}
 #publish .pubField{margin:14px 0}#publish .pubField input,#publish .pubField textarea,#publish .pubField select{font-size:16px;padding:13px 14px}#publish .pubField textarea{min-height:135px}
 #publish input[type=file]{padding:10px;background:#f7faf8}#publish input[type=file]::file-selector-button{border:0;background:#e6f2ea;color:var(--pg);font-weight:800;border-radius:10px;padding:9px 11px;margin-right:9px}
 #publish .pubActions{position:sticky;bottom:76px;z-index:12;display:flex!important;gap:8px;margin:20px -7px -7px;padding:9px;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);border-radius:18px;box-shadow:0 8px 28px rgba(18,46,34,.12)}#publish .pubActions .pubBtn{flex:1;width:auto!important;margin:0!important}
 #publish .pubPreviewShell{margin:0!important;padding:6px;border-radius:22px}#publish .pubBrowser{border-radius:17px}#publish .pubBrowserTop{height:32px;padding:0 9px}#publish .pubUrl{font-size:8px;padding:4px 7px}#publish .pubSiteMockHead{padding:12px}#publish .pubPreviewBody{padding:15px}#publish .pubHero{height:205px;border-radius:14px}#publish .pubPreviewBody h3{font-size:23px}#publish .pubPreviewText{font-size:13.5px;line-height:1.6}
 #publish .pubGallery{gap:5px}#publish .pubGallery img{height:100px}#publish .pubRow{border-radius:14px;padding:12px;background:#fafcfb;margin:7px 0;border:1px solid #edf1ee}
}
`;
document.head.appendChild(s);
})();