(()=>{
  const PAGEKEY='horticulture-app-current-page';
  function openSuggestions(){
    if(!window.HorticultureSuggestions?.show)return false;
    // La tuile Suggestions de l'accueil utilisait encore cet ancien gestionnaire.
    // On enregistre donc ici la même page que pour le menu et l'action rapide.
    localStorage.setItem(PAGEKEY,'suggestionsApp');
    window.HorticultureSuggestions.show();
    requestAnimationFrame(()=>{
      const page=document.getElementById('suggestionsApp');
      if(!page)return;
      document.querySelectorAll('main.app > .view').forEach(v=>{
        const on=v===page;
        v.classList.toggle('active',on);
        v.style.setProperty('display',on?'block':'none','important');
      });
      page.style.width='100%';
      page.style.maxWidth='100%';
      window.scrollTo(0,0);
    });
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