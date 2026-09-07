(()=>{
'use strict';
if(window.__horticultureMessagingAuthBridgeV1)return;window.__horticultureMessagingAuthBridgeV1=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const TICKET='horticulture-messaging-auth-ticket-v1',SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
function persistent(){return !!localStorage.getItem(PERSIST)}
function saveTicket(v){if(!v)return;if(persistent()){localStorage.setItem(TICKET,v);sessionStorage.removeItem(TICKET)}else{sessionStorage.setItem(TICKET,v);localStorage.removeItem(TICKET)}}
function ticket(){return localStorage.getItem(TICKET)||sessionStorage.getItem(TICKET)||''}
function clear(){localStorage.removeItem(TICKET);sessionStorage.removeItem(TICKET)}
async function login(username,password,remember){if(!username||!password)return false;try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'createMessagingSession',username:String(username).trim(),password:String(password),remember:!!remember}),cache:'no-store'}),j=await r.json();if(!j?.ok)return false;saveTicket(j.ticket);window.dispatchEvent(new CustomEvent('horticulture-messaging-auth-ready',{detail:{userId:j.userId,email:j.email,expiresAt:j.expiresAt}}));return true}catch{return false}}
document.addEventListener('submit',e=>{if(e.target?.id!=='loginForm')return;const u=document.querySelector('#username')?.value||'',p=document.querySelector('#password')?.value||'',remember=!!document.querySelector('#loginForm .opts input[type="checkbox"]')?.checked;if(u&&p)login(u,p,remember)},true);
document.addEventListener('click',e=>{if(e.target?.id==='saveFirstPwd'){const p=document.querySelector('#p1')?.value||'';setTimeout(()=>{let s=null;try{s=JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{}if(s?.username&&p)login(s.username,p,persistent())},1400)}if(e.target?.id==='logout'||e.target?.closest?.('#logout'))clear()},true);
window.HorticultureMessagingAuth={ticket,login,clear};
})();
