(()=>{
const USERS='horticulture-admin-users-v2';
const MAP={communication:['Publier','Actualités'],sorties:['Sorties'],adherents:['Adhérents'],comptabilite:['Comptabilité','Trésorerie'],suggestions:['Suggestions'],acces:['Gestion des accès']};
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]')}catch{return[]}}
function drawerAllowed(){const visible=[...document.querySelectorAll('.dlist button')].filter(b=>getComputedStyle(b).display!=='none').map(b=>(b.textContent||'').trim());const set=new Set();for(const[p,words]of Object.entries(MAP))if(visible.some(t=>words.some(w=>t.includes(w))))set.add(p);return set}
function currentFromDrawer(){const full=(document.querySelector('#dname')?.textContent||'').trim();if(!full||full==='Utilisateur')return null;const list=users();return list.find(u=>`${u.firstName||''} ${u.lastName||''}`.trim()===full)||list.find(u=>u.firstName===full)||null}
function pFor(el){const p=el.dataset?.permission;if(p)return p;const t=(el.textContent||'').trim();for(const[x,words]of Object.entries(MAP))if(words.some(w=>t.includes(w)))return x;return''}
function apply(){const home=document.querySelector('#home');if(!home)return;const allowed=drawerAllowed();
 home.querySelectorAll('.dashTile').forEach(el=>{const p=pFor(el);if(!p)return;el.classList.toggle('homeNoAccess',!allowed.has(p))});
 home.querySelectorAll('.quickBtn').forEach(el=>{if(el.classList.contains('public'))return;const p=pFor(el);if(p)el.classList.toggle('homeNoAccess',!allowed.has(p))});
 const u=currentFromDrawer();if(u){const first=(u.firstName||'').trim();const fn=(u.function||u.fonction||u.role||'Compte').trim();if(first){home.querySelectorAll('#name,.dashWelcome .name').forEach(e=>e.textContent=first)}home.querySelectorAll('#role,.dashWelcome .chip').forEach(e=>e.textContent=u.role==='Super Admin'?'Super Admin':fn)}
}
const st=document.createElement('style');st.textContent='#home .homeNoAccess{display:none!important}';document.head.appendChild(st);
window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});setInterval(apply,500);setTimeout(apply,0);setTimeout(apply,300);
})();