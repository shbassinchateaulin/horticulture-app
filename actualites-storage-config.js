/* Shared contract for the central news storage.
 * The admin UI must not expose batches/releases to users.
 */
(function(global){
  'use strict';
  const config = Object.freeze({
    owner: 'shbassinchateaulin',
    contentRepo: 'horticulture-contenus',
    contentBranch: 'main',
    indexPath: 'actualites/index.json',
    articlePath: id => `actualites/${id}/contenu.json`,
    layoutPath: id => `actualites/${id}/layout.json`,
    articleId: number => `actu-${String(number).padStart(4,'0')}`,
    media: Object.freeze({
      provider: 'github-release',
      batchPrefix: 'medias-',
      softAssetLimit: 900,
      hardAssetLimit: 1000,
      atomicArticle: true
    })
  });

  function chooseBatch(batches, requiredAssets) {
    if (!Number.isInteger(requiredAssets) || requiredAssets < 1) throw new Error('Nombre de fichiers invalide');
    const ordered=(batches||[]).slice().sort((a,b)=>(a.number||0)-(b.number||0));
    const current=ordered[ordered.length-1];
    if (current && (current.assetCount||0)+requiredAssets <= config.media.softAssetLimit) return {create:false,batch:current};
    const next=(current?.number||0)+1;
    return {create:true,batch:{number:next,name:`${config.media.batchPrefix}${String(next).padStart(4,'0')}`,assetCount:0}};
  }

  function planDelete(article) {
    if (!article?.id) throw new Error('Actualité invalide');
    return {
      articleId: article.id,
      batch: article.mediaLocation?.batch || null,
      releaseId: article.mediaLocation?.releaseId || null,
      assets: (article.media||[]).map(m=>({id:m.assetId||null,name:m.assetName||m.name||null})).filter(x=>x.id||x.name)
    };
  }

  global.HorticultureNewsStorage={config,chooseBatch,planDelete};
})(window);
