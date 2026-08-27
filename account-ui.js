(()=>{
const K='horticulture-admin-users-v2',SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1';
const RULES={communication:['Publier','Actualités','Nouvelle publication'],sorties:['Sorties','Inscriptions','Nouvelle sortie'],adherents:['Adhérents','Ajouter un adhérent'],comptabilite:['Comptabilité','Trésorerie'],suggestions:['Suggestions','Voir les suggestions'],acces:['Gestion des accès']};
function list(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function session(){for(const raw of [localStorage.getItem(PK),sessionStorage.getItem(SK)])try{const s=JSON.parse(raw||'null');if(s?.id||s?.username)return s}catch{}return null}
function me(){const s=session();if(!s)return null;return list().find(u=>String(u.id)===String(s.id))||list().find(u=>u.username===s.username)||s}
function get(u,...ks){for(const k of ks){const v=u?.[k];if(v!=null&&String(v).trim())return String(v).trim()}return''}
function superAdmin(u){return get(u,'role')==='Super Admin'||get(u,'username')==='superadmin'}
function permissions(u){let p=u?.permissions||[];if(typeof p==='string')p=p.split(/[,;|]/);return new Set(p.map(x=>String(x).trim()))}
function pFor(el){const d=el.dataset?.permission;if(d)return d;const t=(el.textContent||'').trim();for(const[p,ws]of Object.entries(RULES))if(ws.some(w=>t.includes(w)))return p;return''}
function setText(sel,text){if(!text)return;document.querySelectorAll(sel).forEach(e=>e.textContent=text)}
function apply(){const u=me();if(!u)return;const ps=permissions(u),sa=superAdmin(u);
 document.querySelectorAll('[data-permission],.dashTile,.quickBtn').forEach(el=>{const p=pFor(el);if(p)el.style.setProperty('display',sa||ps.has(p)?'':'none','important')});
 const first=get(u,'firstName','firstname','first_name');const last=get(u,'lastName','lastname','last_name');const fn=get(u,'function','fonction')||get(u,'role')||'Compte';const full=[first,last].filter(Boolean).join(' ');const ini=((first[0]||'')+(last[0]||'')).toUpperCase()||'U';
 setText('#name,#home .name,.welcomeName,.admWelcomeName',first||'Utilisateur');setText('#role,#home .chip,.welcomeRole,.admWelcomeRole',sa?'Super Admin':fn);setText('#dname',full||first||'Utilisateur');setText('#drole',sa?'Super Admin':fn);
 const prof=[...document.querySelectorAll('.admProfile')];prof.forEach(box=>{const spans=box.querySelectorAll('span,b');if(spans.length)spans[spans.length-1].textContent=full||first||'Utilisateur';const av=box.querySelector('.admAvatar,img');if(av&&!av.matches('img'))av.textContent=ini});
 document.querySelectorAll('.admAvatar').forEach(a=>{a.textContent=ini;a.style.fontWeight='800'});
}
window.HorticultureAccountUI={apply};window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});setInterval(apply,1000);setTimeout(apply,0);setTimeout(apply,250);setTimeout(apply,1000);
})();