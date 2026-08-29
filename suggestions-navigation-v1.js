(()=>{
const PAGEKEY='horticulture-app-current-page';
let restoring=false;
function suggestionsActive(){return document.getElementById('suggestionsApp')?.classList.contains('active')}
function clearForcedDisplays(){document.querySelectorAll('main.app > .view').forEach(v=>v.style.removeProperty('display'))}
function forceView(id,remember=true){
  clearForcedDisplays();
  document.querySelectorAll('main.app > .view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.getElementById('drawer')?.classList.remove('open');
  if(remember)localStorage.setItem(PAGEKEY,id);
  if(id==='suggestionsApp')window.HorticultureSuggestions?.show?.();
  window.scrollTo(0,0);
}
function isSuggestionsControl(el){if(!el)return false;if(el.matches?.('[data-permission="suggestions"]'))return true;const text=(el.textContent||'').trim().toLowerCase();return (!!el.closest?.('.dlist')||el.classList?.contains('quickBtn'))&&text.includes('suggestion')}
function routeFromControl(el){if(!el)return'';return String(el.dataset?.go||el.getAttribute?.('data-page')||'').trim()}
function isSuggestionsBack(el){return !!el?.closest?.('#suggestionsApp')&&(el.matches?.('[data-back]')||el.classList?.contains('back'))}
document.addEventListener('click',e=>{
  const el=e.target.closest?.('button,a,[data-go],[data-page]');
  if(!el)return;
  if(isSuggestionsBack(el)){e.preventDefault();e.stopImmediatePropagation();localStorage.setItem(PAGEKEY,'home');forceView('home',false);return}
  if(isSuggestionsControl(el)){e.preventDefault();e.stopImmediatePropagation();forceView('suggestionsApp',true);return}
  const route=routeFromControl(el);
  if(suggestionsActive()&&route&&route!=='suggestionsApp'){
    // Quitter Suggestions proprement : empêcher toute restauration automatique
    localStorage.setItem(PAGEKEY,route);
    clearForcedDisplays();
    document.getElementById('suggestionsApp')?.classList.remove('active');
    // On laisse le routeur principal de l'app ouvrir la destination (home/check/publish/access...).
  }
},true);
function css(){if(document.getElementById('suggestions-mobile-nav-style'))return;const s=document.createElement('style');s.id='suggestions-mobile-nav-style';s.textContent=`main.app>#suggestionsApp:not(.active){display:none}main.app>#suggestionsApp.active{display:block}@media(max-width:760px){#suggestionsApp{width:100%;padding:2px 0 110px;overflow-x:hidden}#suggestionsApp>.back{margin:0 0 8px;padding:8px 2px;font-size:13px}#suggestionsApp .sugHead{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px}#suggestionsApp .sugAdd{width:100%;min-height:46px;border-radius:13px;font-size:14px}#suggestionsApp .sugStats{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:11px 0 13px}#suggestionsApp .sugTools{display:block;margin-bottom:12px}#suggestionsApp .sugSearch{width:100%;height:45px;font-size:15px}.sugOverlay{align-items:end;padding:0}.sugModal{width:100%;max-height:91vh;border-radius:20px 20px 0 0}.sugModal input,.sugModal textarea,.sugModal select{font-size:16px}}`;document.head.appendChild(s)}
function restore(){css();if(restoring||localStorage.getItem(PAGEKEY)!=='suggestionsApp')return;restoring=true;let tries=0;const timer=setInterval(()=>{tries++;if(localStorage.getItem(PAGEKEY)!=='suggestionsApp'){clearInterval(timer);restoring=false;return}if(document.getElementById('suggestionsApp')&&window.HorticultureSuggestions?.show){forceView('suggestionsApp',false);clearInterval(timer);restoring=false}else if(tries>=20){clearInterval(timer);restoring=false;localStorage.setItem(PAGEKEY,'home');clearForcedDisplays()}},150)}
window.addEventListener('pageshow',()=>{clearForcedDisplays();restore()});
document.addEventListener('DOMContentLoaded',restore);
setTimeout(restore,150);
window.HorticultureSuggestionsNavigation={showSuggestions:()=>forceView('suggestionsApp',true),showHome:()=>{localStorage.setItem(PAGEKEY,'home');forceView('home',false)}};
})();