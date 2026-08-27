(()=>{
const K='horticulture-admin-users-v2';
const LABELS={communication:'Actualités',sorties:'Sorties',adherents:'Adhérents',comptabilite:'Comptabilité',suggestions:'Suggestions',acces:'Gestion des accès'};
function currentUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function visibleAccess(){const sec=document.querySelector('#access');return sec&&getComputedStyle(sec).display!=='none'}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function initials(u){return ((u.firstName?.[0]||'')+(u.lastName?.[0]||'')).toUpperCase()||'U'}
function status(u){return !u.active?['off','Résilié']:u.firstLogin?['first','Première connexion']:['ok','Actif']}
function idOf(el){return el.dataset.liveUser||el.querySelector('[data-term]')?.dataset.term||el.querySelector('[data-edit]')?.dataset.edit||''}
function card(u){const [cls,txt]=status(u),perms=(u.permissions||[]).map(p=>LABELS[p]||p).join(', ')||'Aucun';return `<div class="userCard2" data-live-user="${esc(u.id)}"><div class="avatar2">${esc(initials(u))}</div><div class="meta2"><b>${esc(u.firstName)} ${esc(u.lastName)}</b><small>${esc(u.function||u.role)} • ${esc(u.email||'Aucun e-mail')}</small><small>Identifiant : <b>${esc(u.username)}</b></small><small>Accès : ${esc(perms)}</small><div class="userActions"><button class="miniBtn" data-edit="${esc(u.id)}">Modifier les accès</button><button class="miniBtn" data-reset="${esc(u.id)}">Réinitialiser le mot de passe</button><button class="miniBtn danger" data-term="${esc(u.id)}">${u.active?'Résilier l’accès':'Réactiver l’accès'}</button></div></div><span class="pill ${cls}">${txt}</span></div>`}
function reconcile(list){if(!visibleAccess()||!Array.isArray(list))return;const host=document.querySelector('#access .userList');if(!host)return;const remote=list.filter(u=>u.id!=='superadmin'),ids=new Set(remote.map(u=>String(u.id)));host.querySelectorAll('.userCard2').forEach(el=>{const id=idOf(el);if(id&&id!=='superadmin'&&!ids.has(String(id)))el.remove()});const existing=new Set([...host.querySelectorAll('.userCard2')].map(idOf).filter(Boolean).map(String));remote.forEach(u=>{if(!existing.has(String(u.id)))host.insertAdjacentHTML('beforeend',card(u))})}
window.addEventListener('horticulture-users-synced',e=>reconcile(e.detail?.users||currentUsers()));
})();