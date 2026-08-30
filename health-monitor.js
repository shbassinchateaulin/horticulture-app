(()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('health')==='0'){localStorage.removeItem('horticulture-health-mode');return}
  const enabled=q.get('health')==='1'||localStorage.getItem('horticulture-health-mode')==='1';
  if(!enabled)return;
  localStorage.setItem('horticulture-health-mode','1');
  const start=performance.now();
  let last=performance.now(),worstDelay=0,longTasks=0,lastLongTask=0,lastError='Aucune';
  const previous=(()=>{try{return JSON.parse(localStorage.getItem('horticulture-health-last')||'null')}catch{return null}})();
  window.addEventListener('error',e=>{lastError=String(e.message||'Erreur JavaScript').slice(0,160)});
  window.addEventListener('unhandledrejection',e=>{lastError=String(e.reason?.message||e.reason||'Promise rejetée').slice(0,160)});
  try{new PerformanceObserver(list=>{for(const e of list.getEntries()){longTasks++;lastLongTask=Math.max(lastLongTask,Math.round(e.duration||0))}}).observe({type:'longtask',buffered:true})}catch(_){ }
  const box=document.createElement('div');
  box.id='horticultureHealthPanel';
  box.style.cssText='position:fixed;left:10px;bottom:10px;z-index:2147483647;width:min(330px,calc(100vw - 20px));background:#10251fcc;color:#fff;border:1px solid #ffffff2c;border-radius:12px;padding:10px 12px;font:12px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;box-shadow:0 8px 30px #0004;backdrop-filter:blur(8px);pointer-events:none';
  function snap(){
    const now=performance.now(),delay=Math.max(0,Math.round(now-last-1000));last=now;worstDelay=Math.max(worstDelay,delay);
    const resources=performance.getEntriesByType('resource').length;
    const nodes=document.getElementsByTagName('*').length;
    const state=delay>1800||lastLongTask>1800?'FREEZE DÉTECTÉ':delay>350||lastLongTask>350?'CHARGE ÉLEVÉE':'OK';
    const data={at:new Date().toISOString(),state,delay,worstDelay,longTasks,lastLongTask,resources,nodes,lastError,uptime:Math.round((now-start)/1000)};
    try{localStorage.setItem('horticulture-health-last',JSON.stringify(data))}catch(_){ }
    box.innerHTML='<b>État de santé : '+state+'</b><br>Délai interface : '+delay+' ms · pire : '+worstDelay+' ms<br>Tâches longues : '+longTasks+' · pire : '+lastLongTask+' ms<br>Ressources chargées : '+resources+' · éléments DOM : '+nodes+'<br>Dernière erreur : '+String(lastError).replace(/[<>]/g,'')+(previous?'<br><span style="opacity:.7">Session précédente : '+String(previous.state||'inconnue')+' · pire '+Number(previous.worstDelay||0)+' ms</span>':'');
  }
  document.body.appendChild(box);snap();setInterval(snap,1000);
  window.HorticultureHealth={disable(){localStorage.removeItem('horticulture-health-mode');location.href=location.pathname},snapshot(){try{return JSON.parse(localStorage.getItem('horticulture-health-last')||'null')}catch{return null}}};
})();