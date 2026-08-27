(()=>{
const USERS='horticulture-admin-users-v2',SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1';
const RULES={communication:['Publier','Actualités','Nouvelle publication'],sorties:['Sorties','Inscriptions'],adherents:['Adhérents'],comptabilite:['Comptabilité','Trésorerie'],suggestions:['Suggestions'],acces:['Gestion des accès']};
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]')}catch{return[]}}
function sess(){for(const raw of [localStorage.getItem(PK),sessionStorage.getItem(SK)])try{const s=JSON.parse(raw||'null');if(s)return s}catch{}return null}
function val(o,...keys){for(const k of keys)if(o?.[k]!=null&&String(o[k]).trim())return String(o[k]).trim();return''}
function me(){const s=sess();if(!s)return null;const list=users();const id=val(s,'id','userId','user_id'),un=val(s,'username','user','login');return (id&&list.find(u=>String(u.id)===id))||(un&&list.find(u=>val(u,'username','user','login')===un))||s}
function isSuper(u){return val(u,'role').toLowerCase()==='super admin'||val(u,'username')==='superadmin'}
function perms(u){const p=u?.permissions??u?.permission??u?.permissionsList??[];if(Array.isArray(p))return p;if(typeof p==='string')return p.split(/[,;|]/).map(x=>x.trim()).filter(Boolean);return[]}
function perm(el){if(el.dataset?.permission)return el.dataset.permission;const t=(el.textContent||'').trim();for(const[p,words]of Object.entries(RULES))if(words.some(w=>t.includes(w)))return p;return null}
function apply(){const u=me();if(!u)return;const allowed=new Set(perms(u));document.querySelectorAll('.dashTile,.quickBtn,.dlist button,[data-permission]').forEach(el=>{const p=perm(el);if(!p)return;el.style.setProperty('display',isSuper(u)||allowed.has(p)?'':'none','important')});
 const first=val(u,'firstName','firstname','first_name','First Name','FIRST NAME','FIRST_NAME');const last=val(u,'lastName','lastname','last_name','Last Name','LAST NAME','LAST_NAME');const fn=val(u,'function','fonction','Function','Fonction','FUNCTION')||val(u,'role')||'Compte';const full=[first,last].filter(Boolean).join(' ');const initials=((first[0]||'')+(last[0]||'')).toUpperCase()||'U';
 document.querySelectorAll('#home .name').forEach(el=>{if(first)el.textContent=first});document.querySelectorAll('#home .chip').forEach(el=>{el.textContent=isSuper(u)?'Super Admin':fn});document.querySelectorAll('.admProfile span').forEach(el=>{if(full)el.textContent=full});document.querySelectorAll('.admAvatar').forEach(el=>{el.innerHTML='';el.textContent=initials;el.style.fontWeight='800';el.style.fontSize='13px';el.style.padding='0'});
}
window.addEventListener('horticulture-users-synced',apply);window.addEventListener('pageshow',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});new MutationObserver(()=>apply()).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,0);setTimeout(apply,300);setTimeout(apply,1200);
})();