(()=>{
let cachedPlant=null;
async function getPlantData(){
  if(cachedPlant)return cachedPlant;
  try{
    const r=await fetch('./dashboard-plant-fix.js?v=3',{cache:'no-store'});
    const t=await r.text();
    const m=t.match(/const plant='(data:image\/webp;base64,[A-Za-z0-9+/=]+)'/);
    if(m){cachedPlant=m[1];return cachedPlant;}
  }catch(e){console.warn('Plant image load failed',e)}
  return null;
}
async function renderPlant(){
  const banner=document.querySelector('#home .dashWelcome');
  if(!banner)return;
  const data=await getPlantData();
  if(!data)return;
  let img=banner.querySelector('.approvedPlantImage');
  if(!img){
    img=document.createElement('img');
    img.className='approvedPlantImage';
    img.alt='';
    img.setAttribute('aria-hidden','true');
    banner.appendChild(img);
  }
  if(img.src!==data)img.src=data;
}
const css=document.createElement('style');
css.id='approved-plant-render-style';
css.textContent=`
#home .dashWelcome{position:relative!important;overflow:hidden!important;background:#fff!important}
#home .dashWelcome:after{display:none!important;background:none!important}
#home .dashWelcome .approvedPlantImage{position:absolute!important;z-index:1!important;right:0!important;top:0!important;width:52%!important;height:100%!important;object-fit:cover!important;object-position:center right!important;opacity:.96!important;pointer-events:none!important;mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,.35) 20%,#000 48%);-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,.35) 20%,#000 48%)}
#home .dashWelcome>img,#home .dashWelcome .welcomeCopy{position:relative!important;z-index:2!important}
@media(max-width:760px){#home .dashWelcome .approvedPlantImage{width:46%!important;opacity:.76!important;object-position:center right!important;mask-image:linear-gradient(to right,transparent 0%,#000 48%);-webkit-mask-image:linear-gradient(to right,transparent 0%,#000 48%)}}
`;
document.head.appendChild(css);
renderPlant();
setTimeout(renderPlant,150);
setTimeout(renderPlant,600);
setTimeout(renderPlant,1400);
new MutationObserver(()=>renderPlant()).observe(document.body,{childList:true,subtree:true});
})();