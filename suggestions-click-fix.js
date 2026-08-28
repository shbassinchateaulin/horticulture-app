(()=>{
  function openSuggestions(){
    if(!window.HorticultureSuggestions?.show)return false;
    window.HorticultureSuggestions.show();
    // Certains scripts historiques pilotent les vues avec des styles inline.
    // On force uniquement la vue Suggestions après leur clic, sans toucher aux autres modules.
    requestAnimationFrame(()=>{
      const page=document.getElementById('suggestionsApp');
      if(!page)return;
      document.querySelectorAll('main.app > .view').forEach(v=>{
        if(v!==page){v.classList.remove('active');v.style.display='none'}
      });
      page.classList.add('active');
      page.style.display='block';
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