(()=>{
const USERS='horticulture-admin-users-v2',SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1';
const RULES={communication:['Publier','Actualités','Nouvelle publication'],sorties:['Sorties','Inscriptions'],adherents:['Adhérents'],comptabilite:['Comptabilité','Trésorerie'],suggestions:['Suggestions'],acces:['Gestion des accès']};
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]')}catch{return[]}}
function sess(){for(const raw of [localStorage.getItem(PK),sessionStorage.getItem(SK)])try{const s=JSON.parse(raw||'null');if(s?.username)return s}catch{}return null}
function me(){const s=sess();if(!s)return null;return users().find(u=>String(u.id)===String(s.id))||users().find(u=>u.username===s.username)||s}
function isSuper(u){return u?.role==='Super Admin'||u?.username==='superadmin'}
function perm(el){if(el.dataset?.permission)return el.dataset.permission;const t=(el.textContent||'').trim();for(const [p,words] of Object.entries(RULES))if(words.some(w=>t.includes(w)))return p;return null}
function apply(){const u=me();if(!u)return;const allowed=new Set(u.permissions||[]);document.querySelectorAll('.dashTile,.quickBtn,.dlist button,[data-permission]').forEach(el=>{const p=perm(el);if(!p)return;el.style.setProperty('display',isSuper(u)||allowed.has(p)?'':'none','important')});
 const first=u.firstName||u.firstname||u.first_name||'';const fn=u.function||u.fonction||u.role||'Compte';
 document.querySelectorAll('#home .name').forEach(el=>{if(first)el.textContent=first});
 document.querySelectorAll('#home .chip').forEach(el=>{el.textContent=isSuper(u)?'Super Admin':fn});
 document.querySelectorAll('.admProfile span').forEach(el=>{if(first)el.textContent=first});
}
window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});setTimeout(apply,50);setTimeout(apply,700);
})();