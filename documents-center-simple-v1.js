(()=>{
'use strict';
if(window.__horticultureDocumentsSimpleV1)return;window.__horticultureDocumentsSimpleV1=true;
const META='horticulture-documents-meta-v2';
function load(){try{return JSON.parse(localStorage.getItem(META)||'{}')}catch(_){return{}}}
function save(x){try{localStorage.setItem(META,JSON.stringify(x))}catch(_){}}
function migrate(){const x=load();x.folders=Array.isArray(x.folders)?x.folders:[];x.docs=Array.isArray(x.docs)?x.docs:[];
 const mapPath=p=>{p=String(p||'');if(p==='Classement'||p.startsWith('Classement/'))return 'Fichiers'+p.slice('Classement'.length);if(p==='Espace collectif'||p.startsWith('Espace collectif/'))return 'Fichiers'+p.slice('Espace collectif'.length);return p};
 x.folders=x.folders.map(mapPath).filter(Boolean);x.docs=x.docs.map(d=>({...d,folder:mapPath(d.folder),scope:'shared'}));
 if(!x.folders.includes('Documents générés'))x.folders.push('Documents générés');if(!x.folders.includes('Fichiers'))x.folders.push('Fichiers');
 x.folders=[...new Set(x.folders.filter(f=>f!=='Classement'&&f!=='Espace collectif'))];save(x)
}
function polish(){migrate();const root=document.getElementById('documentsCenter');if(!root)return;
 const intro=root.querySelector('.docCloudIntro p');if(intro)intro.textContent='Documents générés et fichiers de l’association.';
 const cards=[...root.querySelectorAll('.docSpaces > button')];for(const b of cards){const t=(b.textContent||'').toLowerCase();if(t.includes('classement')){b.dataset.folder='Fichiers';const strong=b.querySelector('b');if(strong)strong.textContent='Fichiers';const small=b.querySelector('small');if(small)small.textContent='Tous les dossiers et documents de l’association';}else if(t.includes('espace collectif')){b.remove();}}
 const spaces=root.querySelector('.docSpaces');if(spaces)spaces.style.gridTemplateColumns='repeat(2,1fr)';
 root.querySelector('.docCollectiveNote')?.remove();
 const head=root.querySelector('.docHead h1');if(head)head.textContent='Cloud Documents';
 document.querySelectorAll('[data-module="documents-center"] small').forEach(s=>s.innerHTML='Documents générés<br>et fichiers');
}
new MutationObserver(polish).observe(document.body,{childList:true,subtree:true});
window.addEventListener('storage',e=>{if(e.key===META)polish()});
setTimeout(polish,0);setTimeout(polish,300);setTimeout(polish,1000);
})();