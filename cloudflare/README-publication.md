# Publication sans installation — état d'intégration

Le module HTML est dans `modules/publication/`. Les photos sont converties en WebP dans le navigateur ; les PDF restent inchangés.

## Infrastructure

Le fichier `cloudflare/publication-worker.js` est une **base de serveur non déployée**, et non une preuve de fonctionnement. Il écrit dans `shbassinchateaulin/horticulture-contenus` au moyen de l'API GitHub. Les identifiants GitHub ne doivent jamais être envoyés au navigateur.

Pour une mise en production, un administrateur technique doit une seule fois :
1. Raccorder ce code au Worker Cloudflare existant (ou déployer un Worker séparé).
2. Définir `GITHUB_TOKEN` comme secret Cloudflare, avec droit Contents: Read and write **uniquement** sur le dépôt de contenus.
3. Définir `ALLOWED_ORIGIN` sur l'origine exacte de l'application administrative.
4. Raccorder l'authentification actuelle de l'application à une validation **serveur**. `PUBLISH_SECRET` ne doit pas être transmis ni incorporé au HTML/JS public : le schéma de jeton statique présent dans le prototype n'est pas approprié pour les utilisateurs finaux.
5. Gérer la publication atomique ou sa reprise en cas de transfert partiel, et les conflits de mise à jour des index.
6. Tester avec une actualité contenant une photo et un PDF, puis une sortie avec tranches tarifaires et échéancier ; vérifier l'affichage sur le site public.

**Important :** le module HTML actuel ne transmet pas encore les documents et les tarifs structurés au serveur. Il bloque intentionnellement ces cas. Le backend fourni est un prototype qui doit être raccordé et durci avant activation. Aucune action n'est requise sur les ordinateurs des membres une fois le serveur configuré.
