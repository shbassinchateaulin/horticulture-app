(()=>{
  function isSuggestionsTile(target){
    const tile=target?.closest?.('[data-permission="suggestions"]');
    return tile||null;
  }
  document.addEventListener('click',e=>{
    const tile=isSuggestionsTile(e.target);
    if(!tile)return;
    if(!window.HorticultureSuggestions?.show)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.HorticultureSuggestions.show();
  },true);
})();