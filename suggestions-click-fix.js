(()=>{
  const PAGEKEY='horticulture-app-current-page';
  const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
  let lastAdherentId='';

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
  const cleanPhone=s=>String(s||'').replace(/[^+0-9]/g,'');

  function emailComposer({email,name,title,context='suggestion',reference=''}){
    if(!email)return alert('Aucune adresse e-mail n’est renseignée.');
    const o=document.createElement('div');o.className='sugMessageOverlay';
    const isAdherent=context==='adherent';
    o.innerHTML=`<div class="sugMessagePanel"><div class="sugMessageHead"><div><h2>${isAdherent?'Écrire à':'Répondre à'} ${esc(name||'la personne')}</h2><p>${esc(email)}</p></div><button data-x>×</button></div><div class="sugMessageContext"><span>${isAdherent?'Adhérent':'Suggestion'}</span><b>${esc(title)}</b></div><label>Objet</label><input data-subject value="${esc(isAdherent?'Votre adhésion — Société d’Horticulture':'À propos de votre suggestion')}"><label>Votre message</label><textarea data-message autofocus placeholder="Écrivez votre message…"></textarea><div class="sugMessageNote">L’e-mail sera automatiquement présenté au nom de la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.</div><div class="sugMessageActions"><button data-cancel>Annuler</button><button class="send" data-send>Envoyer le message</button></div></div>`;
    document.body.appendChild(o);
    const close=()=>o.remove();o.querySelector('[data-x]').onclick=close;o.querySelector('[data-cancel]').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    o.querySelector('[data-send]').onclick=async()=>{
      const send=o.querySelector('[data-send]'),message=o.querySelector('[data-message]').value.trim(),subject=o.querySelector('[data-subject]').value.trim();
      if(!message)return alert('Écrivez votre message avant de l’envoyer.');
      send.disabled=true;send.textContent='Envoi…';
      try{
        const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'sendIntegratedMessage',message:{to:email,recipientName:name,context,reference,contextTitle:title,subject,message}})}),j=await r.json();
        if(!j?.ok)throw Error(j?.error||'Envoi impossible');
        o.querySelector('.sugMessagePanel').innerHTML='<div class="sugMessageSuccess"><div>✓</div><h2>Message envoyé</h2><p>Votre message a bien été envoyé à '+esc(email)+'.</p><button data-done>Fermer</button></div>';
        o.querySelector('[data-done]').onclick=close;
      }catch(err){send.disabled=false;send.textContent='Envoyer le message';alert(err.message)}
    };
    setTimeout(()=>o.querySelector('[data-message]')?.focus(),50);
  }

  function suggestionComposer(btn){
    const modal=btn.closest('.sugModal');if(!modal)return;
    const info=[...modal.querySelectorAll('.sugInfo')];
    const val=label=>{const b=info.find(x=>x.querySelector('span')?.textContent.trim().toLowerCase().includes(label));return b?.querySelector('b')?.textContent.trim()||''};
    const email=val('e-mail'),name=val('nom et prénom'),title=modal.querySelector('.sugDetailHead h2')?.textContent.trim()||'Suggestion';
    if(!email||email==='Non renseigné')return alert('Cette personne n’a pas renseigné d’adresse e-mail.');
    const suggestionId=[...document.querySelectorAll('#suggestionsApp .sugCard[data-id]')].find(c=>c.querySelector('b')?.textContent.trim()===title)?.dataset.id||'';
    emailComposer({email,name,title,context:'suggestion',reference:suggestionId});
  }

  function adherentDataFromModal(modal){
    const get=f=>modal.querySelector(`[data-f="${f}"]`)?.value?.trim()||'';
    const firstName=get('firstName'),lastName=get('lastName');
    return {firstName,lastName,name:[firstName,lastName].filter(Boolean).join(' '),email:get('email'),phone:get('phone'),reference:lastAdherentId};
  }

  function contactChoice(modal){
    const a=adherentDataFromModal(modal);
    const o=document.createElement('div');o.className='sugMessageOverlay aaContactOverlay';
    const emailDisabled=!a.email,phoneDisabled=!cleanPhone(a.phone);
    o.innerHTML=`<div class="sugMessagePanel aaContactPanel"><div class="sugMessageHead"><div><h2>Contacter ${esc(a.name||'cet adhérent')}</h2><p>Choisissez comment vous souhaitez le contacter.</p></div><button data-x>×</button></div><div class="aaContactChoices"><button data-email ${emailDisabled?'disabled':''}><span class="aaContactIcon">✉</span><span><b>Par e-mail</b><small>${emailDisabled?'Aucune adresse e-mail':esc(a.email)}</small></span><strong>›</strong></button><button data-phone ${phoneDisabled?'disabled':''}><span class="aaContactIcon">☎</span><span><b>Par téléphone</b><small>${phoneDisabled?'Aucun numéro':esc(a.phone)}</small></span><strong>›</strong></button></div></div>`;
    document.body.appendChild(o);const close=()=>o.remove();o.querySelector('[data-x]').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    o.querySelector('[data-email]')?.addEventListener('click',()=>{if(emailDisabled)return;close();emailComposer({email:a.email,name:a.name,title:a.name||'Adhérent',context:'adherent',reference:a.reference})});
    o.querySelector('[data-phone]')?.addEventListener('click',()=>{if(phoneDisabled)return;phoneChoice(a,o)});
  }

  function phoneChoice(a,o){
    const phone=cleanPhone(a.phone);if(!phone)return;
    o.querySelector('.aaContactPanel').innerHTML=`<div class="sugMessageHead"><div><h2>${esc(a.name||'Adhérent')}</h2><p>${esc(a.phone)}</p></div><button data-x>×</button></div><div class="aaContactChoices"><a class="aaContactAction" href="tel:${esc(phone)}"><span class="aaContactIcon">☎</span><span><b>Appeler</b><small>Ouvrir l’application Téléphone</small></span><strong>›</strong></a><a class="aaContactAction" href="sms:${esc(phone)}"><span class="aaContactIcon">✉</span><span><b>Envoyer un SMS</b><small>Ouvrir l’application Messages</small></span><strong>›</strong></a></div><button class="aaContactBack" data-back>← Retour</button>`;
    o.querySelector('[data-x]').onclick=()=>o.remove();o.querySelector('[data-back]').onclick=()=>{o.remove();setTimeout(()=>contactChoice(document.querySelector('.aa-modalBack .aa-modal')),0)};
  }

  function decorateAdherentModal(id){
    if(id)lastAdherentId=String(id);
    setTimeout(()=>{
      const backs=[...document.querySelectorAll('.aa-modalBack')],back=backs[backs.length-1],modal=back?.querySelector('.aa-modal');
      if(!modal||modal.querySelector('[data-adherent-contact]')||!modal.querySelector('[data-f="firstName"]')||!modal.querySelector('[data-remove]'))return;
      const actions=modal.querySelector('.aa-actions');if(!actions)return;
      const b=document.createElement('button');b.type='button';b.className='aa-btn aa-contact-btn';b.dataset.adherentContact='1';b.innerHTML='✉&nbsp; Contacter';b.onclick=e=>{e.preventDefault();e.stopPropagation();contactChoice(modal)};
      actions.insertBefore(b,actions.firstChild);
    },40);
  }

  function css(){if(document.getElementById('sug-message-style'))return;const s=document.createElement('style');s.id='sug-message-style';s.textContent=`.sugMessageOverlay{position:fixed;inset:0;background:#001a1266;z-index:1000010;display:grid;place-items:center;padding:14px}.sugMessagePanel{width:min(610px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 25px 80px #001a1240;box-sizing:border-box}.sugMessageHead{display:flex;justify-content:space-between;gap:15px}.sugMessageHead h2{margin:0;color:#173126;font-size:21px}.sugMessageHead p{margin:5px 0 0;color:#718078;font-size:12px}.sugMessageHead button{border:0;background:#f1f5f2;width:36px;height:36px;border-radius:10px;font-size:21px}.sugMessageContext{margin:18px 0;background:#f1f7f3;border-left:4px solid #07583f;padding:12px 14px;border-radius:10px}.sugMessageContext span{display:block;font-size:10px;color:#718078;text-transform:uppercase;font-weight:800;margin-bottom:3px}.sugMessagePanel label{display:block;font-size:11px;font-weight:800;color:#53675e;margin:12px 0 5px}.sugMessagePanel input,.sugMessagePanel textarea{width:100%;box-sizing:border-box;border:1px solid #d7e2dc;border-radius:11px;padding:11px;font:inherit}.sugMessagePanel textarea{min-height:150px;resize:vertical}.sugMessageNote{font-size:11px;color:#718078;margin-top:9px;line-height:1.4}.sugMessageActions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.sugMessageActions button,.sugMessageSuccess button{border:1px solid #d7e2dc;background:#fff;border-radius:10px;padding:11px 14px;font-weight:800}.sugMessageActions .send{border-color:#07583f;background:#07583f;color:#fff}.sugMessageActions .send:disabled{opacity:.55}.sugMessageSuccess{text-align:center;padding:22px 5px}.sugMessageSuccess>div{margin:auto;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#e8f6ed;color:#08744f;font-size:25px;font-weight:900}.sugMessageSuccess h2{color:#173126;margin:13px 0 5px}.sugMessageSuccess p{color:#718078;font-size:13px}.aa-contact-btn{color:#07583f;border-color:#bcd8c8!important;background:#f3faf6!important}.aaContactPanel{width:min(520px,100%)}.aaContactChoices{display:grid;gap:10px;margin-top:20px}.aaContactChoices button,.aaContactAction{width:100%;border:1px solid #dde7e1;background:#fff;border-radius:15px;padding:14px;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;text-align:left;text-decoration:none;color:#173126;box-sizing:border-box}.aaContactChoices button:not(:disabled):hover,.aaContactAction:hover{background:#f5faf7;border-color:#b9d7c6}.aaContactChoices button:disabled{opacity:.45;cursor:not-allowed}.aaContactIcon{width:44px;height:44px;border-radius:13px;background:#edf6f0;color:#07583f;display:grid;place-items:center;font-size:19px}.aaContactChoices b{display:block;font-size:14px}.aaContactChoices small{display:block;color:#718078;margin-top:3px}.aaContactChoices strong{font-size:23px;color:#789086}.aaContactBack{margin-top:14px;border:0;background:transparent;color:#07583f;font-weight:800;padding:8px 0}@media(max-width:600px){.sugMessagePanel{padding:17px}.sugMessageActions{display:grid;grid-template-columns:1fr 1fr}.sugMessageActions button{width:100%}.aa-actions .aa-contact-btn{grid-column:1/-1}}`;document.head.appendChild(s)}

  css();
  document.addEventListener('click',e=>{
    const contact=e.target?.closest?.('.sugContactBtn[data-contact]');
    if(contact){e.preventDefault();e.stopImmediatePropagation();suggestionComposer(contact);return}
    const adh=e.target?.closest?.('#adherentsAdmin [data-edit]');
    if(adh)decorateAdherentModal(adh.dataset.edit);
    const tile=e.target?.closest?.('[data-permission="suggestions"]');
    if(!tile)return;
    e.preventDefault();e.stopImmediatePropagation();openSuggestions();
  },true);
  window.addEventListener('horticulture-notification-target',e=>{if(e.detail?.type==='helloasso-membership'||e.detail?.data?.view==='adherents')setTimeout(()=>decorateAdherentModal(e.detail?.data?.adherentId||''),200)});
  window.HorticultureSuggestionsClickFix={open:openSuggestions};
})();