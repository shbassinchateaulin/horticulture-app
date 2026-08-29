(()=>{
  const PAGEKEY='horticulture-app-current-page';
  function openSuggestions(){
    if(window.HorticultureSuggestionsNavigation?.showSuggestions){window.HorticultureSuggestionsNavigation.showSuggestions();return true}
    if(!window.HorticultureSuggestions?.show)return false;
    localStorage.setItem(PAGEKEY,'suggestionsApp');
    document.querySelectorAll('main.app > .view').forEach(v=>{v.style.removeProperty('display');v.classList.remove('active')});
    window.HorticultureSuggestions.show();
    const page=document.getElementById('suggestionsApp');
    if(page)page.classList.add('active');
    window.scrollTo(0,0);
    return true;
  }
  document.addEventListener('click',e=>{
    const tile=e.target?.closest?.('[data-permission="suggestions"]');
    if(!tile)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openSuggestions();
  },true);
  window.HorticultureSuggestionsClickFix={open:openSuggestions};
})();