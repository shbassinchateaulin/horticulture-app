(()=>{
const USERS='horticulture-admin-users-v2',SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1';
const MAP=[
 {p:'communication',words:['Publier','Actualités','Nouvelle actualité','Nouvelle publication']},
 {p:'sorties',words:['Sorties','Sortie','Inscriptions']},
 {p:'adherents',words:['Adhérents','Adhérent']},
 {p:'comptabilite',words:['Comptabilité','Trésorerie']},
 {p:'suggestions',words:['Suggestions','Suggestion']},
 {p:'acces',words:['Gestion des accès']}
];
function data(){try{return JSON.parse(localStorage.getItem(USERS)||'[]')}catch{return[]}}
function session(){let r=localStorage.getItem(PK)||sessionStorage.getItem(SK);try{return JSON.parse(r||'null')}catch{return null}}
function user(){const s=session();return s&&data().find(u=>String(u.id)===String(s.id)&&u.username===s.username)}
function allowed(u,p){return u?.role==='Super Admin'||(u?.permissions||[]).includes(p)}
function permissionFor(el){const explicit=el.dataset?.permission;if(explicit)return explicit;const t=(el.textContent||'').trim();for(const x of MAP)if(x.words.some(w=>t.includes(w)))return x.p;return null}
function apply(){const u=user();if(!u)return;document.querySelectorAll('.dashTile,.quickBtn,.dlist button,[data-permission]').forEach(el=>{const p=permissionFor(el);if(!p)return;el.style.display=allowed(u,p)?'':'none';el.setAttribute('aria-hidden',allowed(u,p)?'false':'true')});}
/* Block navigation too: hiding a tile is not enough if another script tries to open it. */
document.addEventListener('click',e=>{const el=e.target.closest?.('[data-permission],.dashTile,.quickBtn,.dlist button');if(!el)return;const p=permissionFor(el),u=user();if(p&&!allowed(u,p)){e.preventDefault();e.stopImmediatePropagation();}},true);
window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
new MutationObserver(()=>apply()).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,0);setTimeout(apply,500);
})();