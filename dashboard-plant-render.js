(()=>{
function mountPlant(){
  const welcome=document.querySelector('#home .dashWelcome');
  if(!welcome)return;
  let img=welcome.querySelector('.approvedPlantImage');
  const bg=getComputedStyle(welcome,'::after').backgroundImage||'';
  const m=bg.match(/url\(["']?(data:image\/[^"')]+)["']?\)/);
  if(!m)return;
  if(!img){
    img=document.createElement('img');
    img.className='approvedPlantImage';
    img.alt='';
    img.setAttribute('aria-hidden','true');
    welcome.appendChild(img);
  }
  img.src=m[1];
}
const css=document.createElement('style');
css.id='approved-plant-render-style';
css.textContent=`
#home .dashWelcome{position:relative!important;overflow:hidden!important}
#home .dashWelcome:after{display:none!important}
#home .dashWelcome .approvedPlantImage{position:absolute!important;z-index:1!important;right:0!important;top:0!important;width:55%!important;height:100%!important;object-fit:cover!important;object-position:center right!important;pointer-events:none!important;opacity:.95!important;mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 22%,#000 48%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 22%,#000 48%)}
#home .dashWelcome>img:not(.approvedPlantImage),#home .dashWelcome .welcomeCopy{position:relative!important;z-index:3!important}
@media(max-width:760px){#home .dashWelcome .approvedPlantImage{width:48%!important;opacity:.78!important;object-position:center right!important}}
`;
document.head.appendChild(css);
mountPlant();
setTimeout(mountPlant,200);
setTimeout(mountPlant,800);
})();