(()=>{
  const PAGEKEY='horticulture-app-current-page';
  const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
  let adherentsCache=null,decorateQueued=false;

  function openSuggestions(){
    if(window.HorticultureSuggestionsNavigation?.showSuggestions){window.HorticultureSuggestionsNavigation.showSuggestions();return true}
    if(!window.HorticultureSuggestions?.show)return false;
    localStorage.setItem(PAGEKEY,'suggestionsApp');
    document.querySelectorAll('main.app > .view').forEach(v=>{v.style.removeProperty('display');v.classList.remove('active')});
    window.HorticultureSuggestions.show();
    const page=document.getElementById('suggestionsApp');if(page)page.classList.add('active');
    window.scrollTo(0,0);return true;
  }

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cleanPhone=s=>String(s||'').replace(/[^+0-9]/g,'');
  const ico=k=>({
    mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>',
    sms:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></svg>',
    contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M3 19a5 5 0 0 1 10 0M16 8h5M18.5 5.5V10.5"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  }[k]||'');

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

  async function allAdherents(){
    if(adherentsCache)return adherentsCache;
    try{const r=await fetch(`${API}?action=listAdherentsAdmin&t=${Date.now()}`,{cache:'no-store'}),j=await r.json();adherentsCache=Array.isArray(j)?j:(j.adherents||j.rows||[]);return adherentsCache}catch(_){return[]}
  }
  async function adherentById(id){const rows=await allAdherents();return rows.find(a=>String(a.id)===String(id))||null}

  function contactChoice(a){
    if(!a)return alert('Adhérent introuvable.');
    const name=[a.firstName,a.lastName].filter(Boolean).join(' ').trim()||'cet adhérent';
    const email=String(a.email||'').trim(),phone=String(a.phone||'').trim(),phoneClean=cleanPhone(phone);
    const o=document.createElement('div');o.className='sugMessageOverlay aaContactOverlay';
    o.innerHTML=`<div class="sugMessagePanel aaContactPanel"><div class="sugMessageHead"><div><h2>Contacter ${esc(name)}</h2><p>Choisissez le moyen de contact.</p></div><button data-x>×</button></div><div class="aaContactChoices"><button data-email ${email?'':'disabled'}><span class="aaContactIcon">${ico('mail')}</span><span><b>Par e-mail</b><small>${email?esc(email):'Aucune adresse e-mail'}</small></span>${ico('chevron')}</button><button data-phone ${phoneClean?'':'disabled'}><span class="aaContactIcon">${ico('phone')}</span><span><b>Par téléphone</b><small>${phoneClean?esc(phone):'Aucun numéro de téléphone'}</small></span>${ico('chevron')}</button></div></div>`;
    document.body.appendChild(o);const close=()=>o.remove();o.querySelector('[data-x]').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    o.querySelector('[data-email]')?.addEventListener('click',()=>{if(!email)return;close();emailComposer({email,name,title:name,context:'adherent',reference:String(a.id||'')})});
    o.querySelector('[data-phone]')?.addEventListener('click',()=>{if(!phoneClean)return;phoneChoice({name,phone,phoneClean},o)});
  }

  function phoneChoice(a,o){
    o.querySelector('.aaContactPanel').innerHTML=`<div class="sugMessageHead"><div><h2>${esc(a.name)}</h2><p>${esc(a.phone)}</p></div><button data-x>×</button></div><div class="aaContactChoices"><a class="aaContactAction" href="tel:${esc(a.phoneClean)}"><span class="aaContactIcon">${ico('phone')}</span><span><b>Appeler</b><small>Ouvrir l’application Téléphone</small></span>${ico('chevron')}</a><a class="aaContactAction" href="sms:${esc(a.phoneClean)}"><span class="aaContactIcon">${ico('sms')}</span><span><b>Envoyer un SMS</b><small>Ouvrir l’application Messages</small></span>${ico('chevron')}</a></div><button class="aaContactBack" data-back>← Retour</button>`;
    o.querySelector('[data-x]').onclick=()=>o.remove();o.querySelector('[data-back]').onclick=()=>{o.remove();allAdherents().then(rows=>contactChoice(rows.find(x=>cleanPhone(x.phone)===a.phoneClean)||null))};
  }

  function makeContactButton(id,compact=false){
    const b=document.createElement('button');b.type='button';b.className=compact?'aa-list-contact compact':'aa-list-contact';b.dataset.contactAdherent=id;b.innerHTML=`${ico('contact')}<span>Contacter</span>`;
    b.onclick=async e=>{e.preventDefault();e.stopPropagation();const a=await adherentById(id);contactChoice(a)};return b;
  }

  function decorateAdherentRows(){
    const root=document.getElementById('adherentsAdmin');if(!root)return;
    const ths=root.querySelectorAll('.aa-table thead th');
    if(ths.length&& !root.querySelector('.aa-contact-head')){
      const dateTh=[...ths].find(x=>x.textContent.trim().toLowerCase().includes('date d’adhésion')||x.textContent.trim().toLowerCase().includes("date d'adhésion"));
      if(dateTh){const th=document.createElement('th');th.className='aa-contact-head';th.textContent='Contact';dateTh.after(th)}
    }
    root.querySelectorAll('.aa-table tbody tr').forEach(tr=>{
      if(tr.querySelector('.aa-contact-cell'))return;
      const edit=tr.querySelector('[data-edit]'),id=edit?.dataset.edit;if(!id)return;
      const tds=tr.querySelectorAll('td'),dateTd=tds[5];if(!dateTd)return;
      const td=document.createElement('td');td.className='aa-contact-cell';td.appendChild(makeContactButton(id,false));dateTd.after(td);
    });
    root.querySelectorAll('.aa-mobile .aa-card[data-edit]').forEach(card=>{
      if(card.querySelector('.aa-list-contact'))return;
      const id=card.dataset.edit;if(!id)return;
      const b=makeContactButton(id,true);card.appendChild(b);
    });
  }
  function queueDecorate(){if(decorateQueued)return;decorateQueued=true;requestAnimationFrame(()=>{decorateQueued=false;decorateAdherentRows()})}
  function watchAdherents(){
    const root=document.getElementById('adherentsAdmin');if(!root)return false;
    decorateAdherentRows();new MutationObserver(queueDecorate).observe(root,{childList:true,subtree:true});return true;
  }

  function css(){if(document.getElementById('sug-message-style'))return;const s=document.createElement('style');s.id='sug-message-style';s.textContent=`
.sugMessageOverlay{position:fixed;inset:0;background:#001a1266;z-index:1000010;display:grid;place-items:center;padding:14px}.sugMessagePanel{width:min(610px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 25px 80px #001a1240;box-sizing:border-box}.sugMessageHead{display:flex;justify-content:space-between;gap:15px}.sugMessageHead h2{margin:0;color:#173126;font-size:21px}.sugMessageHead p{margin:5px 0 0;color:#718078;font-size:12px}.sugMessageHead button{border:0;background:#f1f5f2;width:36px;height:36px;border-radius:10px;font-size:21px}.sugMessageContext{margin:18px 0;background:#f1f7f3;border-left:4px solid #07583f;padding:12px 14px;border-radius:10px}.sugMessageContext span{display:block;font-size:10px;color:#718078;text-transform:uppercase;font-weight:800;margin-bottom:3px}.sugMessagePanel label{display:block;font-size:11px;font-weight:800;color:#53675e;margin:12px 0 5px}.sugMessagePanel input,.sugMessagePanel textarea{width:100%;box-sizing:border-box;border:1px solid #d7e2dc;border-radius:11px;padding:11px;font:inherit}.sugMessagePanel textarea{min-height:150px;resize:vertical}.sugMessageNote{font-size:11px;color:#718078;margin-top:9px;line-height:1.4}.sugMessageActions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.sugMessageActions button,.sugMessageSuccess button{border:1px solid #d7e2dc;background:#fff;border-radius:10px;padding:11px 14px;font-weight:800}.sugMessageActions .send{border-color:#07583f;background:#07583f;color:#fff}.sugMessageActions .send:disabled{opacity:.55}.sugMessageSuccess{text-align:center;padding:22px 5px}.sugMessageSuccess>div{margin:auto;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#e8f6ed;color:#08744f;font-size:25px;font-weight:900}.sugMessageSuccess h2{color:#173126;margin:13px 0 5px}.sugMessageSuccess p{color:#718078;font-size:13px}
.aa-list-contact{height:34px;border:1px solid #cfe2d6;background:#f5faf7;color:#07583f;border-radius:9px;padding:0 10px;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;white-space:nowrap}.aa-list-contact:hover{background:#eaf5ee;border-color:#9fc8ae}.aa-list-contact svg{width:16px!important;height:16px!important;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.aa-contact-cell{white-space:nowrap}.aa-contact-head{white-space:nowrap}.aaContactPanel{width:min(520px,100%)}.aaContactChoices{display:grid;gap:10px;margin-top:20px}.aaContactChoices button,.aaContactAction{width:100%;border:1px solid #dde7e1;background:#fff;border-radius:15px;padding:14px;display:grid;grid-template-columns:44px 1fr 20px;align-items:center;gap:12px;text-align:left;text-decoration:none;color:#173126;box-sizing:border-box}.aaContactChoices button:not(:disabled):hover,.aaContactAction:hover{background:#f5faf7;border-color:#b9d7c6}.aaContactChoices button:disabled{opacity:.45;cursor:not-allowed}.aaContactIcon{width:44px;height:44px;border-radius:13px;background:#edf6f0;color:#07583f;display:grid;place-items:center}.aaContactIcon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.aaContactChoices>b,.aaContactChoices span>b{display:block;font-size:14px}.aaContactChoices small{display:block;color:#718078;margin-top:3px}.aaContactChoices>button>svg,.aaContactAction>svg{width:18px;height:18px;fill:none;stroke:#789086;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.aaContactBack{margin-top:14px;border:0;background:transparent;color:#07583f;font-weight:800;padding:8px 0}
@media(max-width:850px){.aa-list-contact.compact{grid-column:2/4;justify-self:start;margin-top:4px;height:32px}.aa-mobile .aa-card{grid-template-columns:auto 1fr auto}.aa-contact-head,.aa-contact-cell{display:none}}
@media(max-width:600px){.sugMessagePanel{padding:17px}.sugMessageActions{display:grid;grid-template-columns:1fr 1fr}.sugMessageActions button{width:100%}}
`;document.head.appendChild(s)}

  css();
  document.addEventListener('click',e=>{
    const contact=e.target?.closest?.('.sugContactBtn[data-contact]');
    if(contact){e.preventDefault();e.stopImmediatePropagation();suggestionComposer(contact);return}
    const tile=e.target?.closest?.('[data-permission="suggestions"]');
    if(!tile)return;e.preventDefault();e.stopImmediatePropagation();openSuggestions();
  },true);
  document.addEventListener('input',e=>{if(e.target?.closest?.('#adherentsAdmin'))queueDecorate()},true);
  let tries=0;const timer=setInterval(()=>{tries++;if(watchAdherents()||tries>80)clearInterval(timer)},250);
  window.addEventListener('horticulture-users-synced',()=>{adherentsCache=null;queueDecorate()});
  window.HorticultureSuggestionsClickFix={open:openSuggestions};
})();