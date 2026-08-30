(()=>{
  function rawSession(){
    try{return JSON.parse(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1')||'null')}catch{return null}
  }
  function users(){try{return JSON.parse(localStorage.getItem('horticulture-admin-users-v2')||'[]')}catch{return[]}}
  function currentUser(){
    const s=rawSession(); if(!s)return null;
    const us=users();
    return us.find(u=>String(u.id)===String(s.id||s.userId||''))||us.find(u=>s.username&&String(u.username).toLowerCase()===String(s.username).toLowerCase())||s;
  }
  function userId(){const u=currentUser();return String(u?.id||u?.userId||'').trim()}

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "64cb7fb2-efb3-4008-9233-5a305d0f31a2",
      safari_web_id: "web.onesignal.auto.185a3882-a3fa-4e4c-9216-d752294e35fc",
      serviceWorkerPath: "horticulture-app/push/onesignal/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/horticulture-app/push/onesignal/" },
      notifyButton: { enable: false },
      welcomeNotification: {
        disable: false,
        title: "Société d’Horticulture et d’Art Floral du Bassin de Châteaulin",
        message: "Merci pour votre intérêt pour l’association. Vous recevrez désormais les informations qui vous concernent directement.",
        url: "https://shbassinchateaulin.github.io/horticulture-app/"
      }
    });

    try{
      OneSignal.Notifications?.addEventListener?.('foregroundWillDisplay',event=>{
        const n=event?.notification||{};
        window.dispatchEvent(new CustomEvent('horticulture-onesignal-push',{detail:{type:String(n.additionalData?.type||n.data?.type||''),title:String(n.title||''),message:String(n.body||''),data:n.additionalData||n.data||{},id:String(n.notificationId||n.id||'')}}));
      });
      OneSignal.Notifications?.addEventListener?.('click',event=>{
        const n=event?.notification||{};
        window.dispatchEvent(new CustomEvent('horticulture-onesignal-click',{detail:{type:String(n.additionalData?.type||n.data?.type||''),title:String(n.title||''),message:String(n.body||''),data:n.additionalData||n.data||{},id:String(n.notificationId||n.id||'')}}));
      });
    }catch(e){console.warn('OneSignal badge bridge',e)}

    let bound='';
    async function syncIdentity(){
      const id=userId();
      if(id&&id!==bound){
        try{await OneSignal.login(id);bound=id;window.dispatchEvent(new CustomEvent('horticulture-onesignal-user-bound',{detail:{userId:id}}))}catch(e){console.warn('OneSignal login',e)}
      }
      if(!id&&bound){try{await OneSignal.logout()}catch(_){} bound=''}
    }
    await syncIdentity();
    window.addEventListener('pageshow',syncIdentity);
    window.addEventListener('storage',syncIdentity);
    window.addEventListener('horticulture-users-synced',syncIdentity);
    document.addEventListener('click',syncIdentity,true);
    document.addEventListener('submit',syncIdentity,true);
    window.HorticultureOneSignal={syncIdentity,userId};
  });
})();
