(()=>{
  const PAGEKEY='horticulture-app-current-page';
  const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
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
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function composer(btn){
    const modal=btn.closest('.sugModal'); if(!modal)return;
    const info=[...modal.querySelectorAll('.sugInfo')];
    const val=label=>{const b=info.find(x=>x.querySelector('span')?.textContent.trim().toLowerCase().includes(label));return b?.querySelector('b')?.textContent.trim()||''};
    const email=val('e-mail'),name=val('nom et prénom'),title=modal.querySelector('.sugDetailHead h2')?.textContent.trim()||'Suggestion';
    if(!email||email==='Non renseigné')return alert('Cette personne n’a pas renseigné d’adresse e-mail.');
    const suggestionId=[...document.querySelectorAll('#suggestionsApp .sugCard[data-id]')].find(c=>c.querySelector('b')?.textContent.trim()===title)?.dataset.id||'';
    const o=document.createElement('div');o.className='sugMessageOverlay';
    o.innerHTML=`<div class="sugMessagePanel"><div class="sugMessageHead"><div><h2>Répondre à ${esc(name||'la personne')}</h2><p>${esc(email)}</p></div><button data-x>×</button></div><div class="sugMessageContext"><span>Suggestion</span><b>${esc(title)}</b></div><label>Objet</label><input data-subject value="À propos de votre suggestion"><label>Votre message</label><textarea data-message autofocus placeholder="Écrivez votre réponse…"></textarea><div class="sugMessageNote">L’e-mail sera automatiquement présenté au nom de la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.</div><div class="sugMessageActions"><button data-cancel>Annuler</button><button class="send" data-send>Envoyer le message</button></div></div>`;
    document.body.appendChild(o); const close=()=>o.remove();o.querySelector('[data-x]').onclick=close;o.querySelector('[data-cancel]').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    o.querySelector('[data-send]').onclick=async()=>{const send=o.querySelector('[data-send]'),message=o.querySelector('[data-message]').value.trim(),subject=o.querySelector('[data-subject]').value.trim();if(!message)return alert('Écrivez votre message avant de l’envoyer.');send.disabled=true;send.textContent='Envoi…';try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'sendIntegratedMessage',message:{to:email,recipientName:name,context:'suggestion',reference:suggestionId,contextTitle:title,subject,message}})}),j=await r.json();if(!j?.ok)throw Error(j?.error||'Envoi impossible');o.querySelector('.sugMessagePanel').innerHTML='<div class="sugMessageSuccess"><div>✓</div><h2>Message envoyé</h2><p>Votre réponse a bien été envoyée à '+esc(email)+'.</p><button data-done>Fermer</button></div>';o.querySelector('[data-done]').onclick=close}catch(err){send.disabled=false;send.textContent='Envoyer le message';alert(err.message)}};
    setTimeout(()=>o.querySelector('[data-message]')?.focus(),50);
  }
  function css(){if(document.getElementById('sug-message-style'))return;const s=document.createElement('style');s.id='sug-message-style';s.textContent=`.sugMessageOverlay{position:fixed;inset:0;background:#001a1266;z-index:1000010;display:grid;place-items:center;padding:14px}.sugMessagePanel{width:min(610px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 25px 80px #001a1240;box-sizing:border-box}.sugMessageHead{display:flex;justify-content:space-between;gap:15px}.sugMessageHead h2{margin:0;color:#173126;font-size:21px}.sugMessageHead p{margin:5px 0 0;color:#718078;font-size:12px}.sugMessageHead button{border:0;background:#f1f5f2;width:36px;height:36px;border-radius:10px;font-size:21px}.sugMessageContext{margin:18px 0;background:#f1f7f3;border-left:4px solid #07583f;padding:12px 14px;border-radius:10px}.sugMessageContext span{display:block;font-size:10px;color:#718078;text-transform:uppercase;font-weight:800;margin-bottom:3px}.sugMessagePanel label{display:block;font-size:11px;font-weight:800;color:#53675e;margin:12px 0 5px}.sugMessagePanel input,.sugMessagePanel textarea{width:100%;box-sizing:border-box;border:1px solid #d7e2dc;border-radius:11px;padding:11px;font:inherit}.sugMessagePanel textarea{min-height:150px;resize:vertical}.sugMessageNote{font-size:11px;color:#718078;margin-top:9px;line-height:1.4}.sugMessageActions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.sugMessageActions button,.sugMessageSuccess button{border:1px solid #d7e2dc;background:#fff;border-radius:10px;padding:11px 14px;font-weight:800}.sugMessageActions .send{border-color:#07583f;background:#07583f;color:#fff}.sugMessageActions .send:disabled{opacity:.55}.sugMessageSuccess{text-align:center;padding:22px 5px}.sugMessageSuccess>div{margin:auto;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#e8f6ed;color:#08744f;font-size:25px;font-weight:900}.sugMessageSuccess h2{color:#173126;margin:13px 0 5px}.sugMessageSuccess p{color:#718078;font-size:13px}@media(max-width:600px){.sugMessagePanel{padding:17px}.sugMessageActions{display:grid;grid-template-columns:1fr 1fr}.sugMessageActions button{width:100%}}`;document.head.appendChild(s)}
  css();
  document.addEventListener('click',e=>{
    const contact=e.target?.closest?.('.sugContactBtn[data-contact]');
    if(contact){e.preventDefault();e.stopImmediatePropagation();composer(contact);return}
    const tile=e.target?.closest?.('[data-permission="suggestions"]');
    if(!tile)return;
    e.preventDefault();e.stopImmediatePropagation();openSuggestions();
  },true);
  window.HorticultureSuggestionsClickFix={open:openSuggestions};
})();