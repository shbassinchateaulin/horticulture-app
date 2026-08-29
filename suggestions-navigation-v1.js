(()=>{
const PAGEKEY='horticulture-app-current-page';
let restoring=false;
function suggestionsActive(){return document.getElementById('suggestionsApp')?.classList.contains('active')}
function forceView(id,remember=true){
  document.querySelectorAll('main.app > .view').forEach(v=>{
    const on=v.id===id;
    v.classList.toggle('active',on);
    v.style.setProperty('display',on?'block':'none','important');
  });
  document.getElementById('drawer')?.classList.remove('open');
  if(remember)localStorage.setItem(PAGEKEY,id);
  if(id==='suggestionsApp'){
    window.HorticultureSuggestions?.show?.();
    requestAnimationFrame(()=>{
      document.querySelectorAll('main.app > .view').forEach(v=>v.style.setProperty('display',v.id==='suggestionsApp'?'block':'none','important'));
      const s=document.getElementById('suggestionsApp');if(s)s.classList.add('active');
    });
  }
  window.scrollTo(0,0);
}
function isSuggestionsControl(el){if(!el)return false;if(el.matches?.('[data-permission="suggestions"]'))return true;const text=(el.textContent||'').trim().toLowerCase();return (!!el.closest?.('.dlist')||el.classList?.contains('quickBtn'))&&text.includes('suggestion')}
function isHomeControl(el){if(!el)return false;const go=(el.dataset?.go||el.getAttribute?.('data-page')||'').toLowerCase(),text=(el.textContent||'').trim().toLowerCase();return go==='home'||text==='accueil'||text.startsWith('accueil ')}
document.addEventListener('click',e=>{const el=e.target.closest?.('button,a,[data-go],[data-page]');if(isSuggestionsControl(el)){e.preventDefault();e.stopImmediatePropagation();forceView('suggestionsApp',true);return}if(isHomeControl(el)&&suggestionsActive()){e.preventDefault();e.stopImmediatePropagation();forceView('home',true)}},true);
function css(){if(document.getElementById('suggestions-mobile-nav-style'))return;const s=document.createElement('style');s.id='suggestions-mobile-nav-style';s.textContent=`main.app>#suggestionsApp:not(.active){display:none!important}main.app>#suggestionsApp.active{display:block!important}@media(max-width:760px){#suggestionsApp{width:100%!important;padding:2px 0 110px!important;overflow-x:hidden}#suggestionsApp>.back{margin:0 0 8px;padding:8px 2px;font-size:13px}#suggestionsApp .sugHead{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px}#suggestionsApp .sugHead h1{font-size:25px;line-height:1.15}#suggestionsApp .sugHead p{display:block;font-size:11px;margin:4px 0 0}#suggestionsApp .sugAdd{width:100%;min-height:46px;border-radius:13px;font-size:14px}#suggestionsApp .sugStats{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:11px 0 13px}#suggestionsApp .sugStat{padding:10px 7px;text-align:center;min-width:0}#suggestionsApp .sugStat b{font-size:18px}#suggestionsApp .sugStat span{display:block;font-size:9px;line-height:1.15;white-space:normal}#suggestionsApp .sugTools{display:block;margin-bottom:12px}#suggestionsApp .sugSearch{width:100%;height:45px;font-size:15px;border-radius:13px}#suggestionsApp .sugFilters{margin-top:8px;padding:1px 1px 5px;gap:6px;scrollbar-width:none}#suggestionsApp .sugFilters::-webkit-scrollbar{display:none}#suggestionsApp .sugFilter{padding:8px 11px;font-size:10px;flex:0 0 auto}#suggestionsApp .sugList{gap:9px}#suggestionsApp .sugCard{padding:13px;border-radius:14px}#suggestionsApp .sugTop>b{font-size:14px;line-height:1.3}#suggestionsApp .sugStatus{font-size:9px;padding:5px 7px;flex:0 0 auto}#suggestionsApp .sugSummary{font-size:12px;line-height:1.45;margin-top:7px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}#suggestionsApp .sugMeta{font-size:10px;line-height:1.35;margin-top:7px}.sugOverlay{align-items:end!important;padding:0!important}.sugModal{width:100%!important;max-height:91vh!important;border-radius:20px 20px 0 0!important;padding:18px 15px calc(18px + env(safe-area-inset-bottom))!important}.sugModal .sugGrid{grid-template-columns:1fr!important}.sugModal input,.sugModal textarea,.sugModal select{font-size:16px!important}.sugActions{position:sticky;bottom:0;background:#fff;padding-top:10px;display:grid!important;grid-template-columns:1fr 1.25fr!important}}`;document.head.appendChild(s)}
function restore(){css();if(restoring)return;if(localStorage.getItem(PAGEKEY)!=='suggestionsApp')return;restoring=true;let tries=0;const timer=setInterval(()=>{tries++;if(document.getElementById('suggestionsApp')&&window.HorticultureSuggestions?.show){forceView('suggestionsApp',false);clearInterval(timer);setTimeout(()=>forceView('suggestionsApp',false),350);restoring=false}else if(tries>=30){clearInterval(timer);restoring=false}},100)}
new MutationObserver(()=>{css();if(localStorage.getItem(PAGEKEY)==='suggestionsApp'&&!suggestionsActive())restore()}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('pageshow',restore);document.addEventListener('DOMContentLoaded',restore);setTimeout(restore,50);setTimeout(restore,800);setTimeout(restore,1800);
window.HorticultureSuggestionsNavigation={showSuggestions:()=>forceView('suggestionsApp',true),showHome:()=>forceView('home',true)};
})();