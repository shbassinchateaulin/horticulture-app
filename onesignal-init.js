(()=>{
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "64cb7fb2-efb3-4008-9233-5a305d0f31a2",
      safari_web_id: "web.onesignal.auto.185a3882-a3fa-4e4c-9216-d752294e35fc",
      serviceWorkerPath: "horticulture-app/push/onesignal/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/horticulture-app/push/onesignal/" },
      notifyButton: { enable: true }
    });
  });
})();
