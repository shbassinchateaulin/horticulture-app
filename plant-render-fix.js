(()=>{
function getPlantData(){
  const s=document.getElementById('dashboard-plant-login-fix');
  if(!s)return null;
  const m=s.textContent.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/);
  return m?m[0]:null;
}
function renderPlant(){
  const banner=document.querySelector('#home .dashWelcome');
  if(!banner)return;
  const data=getPlantData();
  if(!data)return;
  let img=banner.querySelector('.approvedPlantImage');
  if(!img){
    img=document.createElement('img');
    img.className='approvedPlantImage';
    img.alt='';
    img.setAttribute('aria-hidden','true');
    banner.appendChild(img);
  }
  img.src=data;
}
const css=document.createElement('style');
css.id='approved-plant-render-style';
css.textContent=`
#home .dashWelcome{position:relative!important;overflow:hidden!important;background:#fff!important}
#home .dashWelcome:after{display:none!important;background:none!important}
#home .dashWelcome .approvedPlantImage{position:absolute!important;z-index:1!important;right:0!important;top:0!important;width:48%!important;height:100%!important;object-fit:cover!important;object-position:center right!important;opacity:.96!important;pointer-events:none!important;mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,.28) 18%,#000 48%);-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,.28) 18%,#000 48%)}
#home .dashWelcome>img,#home .dashWelcome .welcomeCopy{position:relative!important;z-index:2!important}
@media(max-width:760px){#home .dashWelcome .approvedPlantImage{width:42%!important;opacity:.74!important;object-position:center right!important;mask-image:linear-gradient(to right,transparent 0%,#000 48%);-webkit-mask-image:linear-gradient(to right,transparent 0%,#000 48%)}}
`;
document.head.appendChild(css);
renderPlant();
setTimeout(renderPlant,100);
setTimeout(renderPlant,500);
setTimeout(renderPlant,1200);
new MutationObserver(renderPlant).observe(document.body,{childList:true,subtree:true});
})();