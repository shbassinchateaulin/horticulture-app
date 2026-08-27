(()=>{
const USERS='horticulture-admin-users-v2',SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1';
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS)||'[]')}catch{return[]}}
function getSession(){let raw=localStorage.getItem(PK)||sessionStorage.getItem(SK);try{return JSON.parse(raw||'null')}catch{return null}}
function current(){const s=getSession();if(!s)return null;return getUsers().find(u=>String(u.id)===String(s.id)&&u.username===s.username)||null}
function apply(){const u=current();if(!u)return;const first=(u.firstName||u.username||'Utilisateur').trim();const fn=(u.function||u.role||'Compte').trim();
  const nameTargets=[document.querySelector('#name'),document.querySelector('.dashWelcome .name'),document.querySelector('[data-current-firstname]')].filter(Boolean);
  nameTargets.forEach(el=>{const t=(el.textContent||'').trim();el.textContent=t.toLowerCase().startsWith('bonjour')?`Bonjour ${first}`:first});
  const roleTargets=[document.querySelector('#role'),document.querySelector('#drole'),document.querySelector('.dashWelcome .chip'),document.querySelector('[data-current-role]')].filter(Boolean);
  roleTargets.forEach(el=>el.textContent=fn);
  document.querySelectorAll('.admProfile span').forEach(el=>{if(/Compte|Utilisateur|Super Admin|Président|Secrétaire|Trésor/i.test(el.textContent||''))el.textContent=fn});
}
window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,0);setTimeout(apply,400);
})();