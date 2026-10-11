# Gestion semi-automatique des paiements de sorties

## Installation
1. Ouvrir le Google Sheets privé utilisé pour les inscriptions.
2. Extensions → Apps Script : ajouter un fichier `gestion-sorties.gs` et y copier le contenu du fichier voisin.
3. Exécuter manuellement `installerGestionSorties()` une fois (autoriser Sheets, Gmail et accès à la source GitHub).
4. Dans `Parametres`, saisir `EMAIL_ASSOCIATION` ; laisser `ENVOIS_ACTIFS=NON` tant que la récupération HelloAsso et les liens individuels ne sont pas vérifiés.
5. Lancer `detecterNouvellesSorties()` pour tester la détection.
6. Pour chaque sortie, compléter `Sorties` et `Echeances`. Passer à `Activée` seulement après vérification.
7. Ne passer `ENVOIS_ACTIFS` à `OUI` qu'après test complet avec des comptes de test.

## Colonnes
- Sorties : ID, nom, date, lien HelloAsso, état, notification, tarifs adhérent et non-adhérent, date de validation, adresse responsable.
- Echeances : ID sortie, numéro, date d'appel, date limite, montant, solde variable, suivi des rappels.
- Inscrits : ID inscription, ID sortie, nom, prénom, e-mail, statut, formule, montant payé, lien individuel, source.
- Paiements : ID inscription, sortie, échéance, montant dû, confirmé, dates envoi et rappel, statut, référence.
- Parametres : e-mails et activation.

## Limites avant mise en production
- Le script ne récupère PAS encore les inscrits ni les paiements depuis HelloAsso : il faut connecter l'API ou un export authentifié et rapprocher les transactions.
- Les liens individuels ne sont PAS générés : un lien doit être créé et vérifié côté serveur à l'ouverture, en particulier si les sessions Checkout expirent.
- La colonne `Montant confirmé` doit être renseignée à partir de paiements effectivement confirmés ; ne jamais considérer un e-mail envoyé comme un paiement reçu.
- L'association doit valider les tarifs variables et la configuration avant activation.
- Le script n'est pas encore installé dans le projet Apps Script existant, et aucun déclencheur n'a été créé dans le compte Google.
- Les données personnelles restent dans un classeur privé ; ne pas les publier dans GitHub.
- Vérifier le format JSON des sorties et les identifiants de sortie avant production.
- Prévoir une gestion des accès et des journaux, et un traitement des erreurs API et de quotas.

## Exemple Parenthèse angevine
- 14/01/2027 : 130 €, limite 22/01/2027.
- 14/03/2027 : 130 €, limite 22/03/2027.
- 07/05/2027 : demande des deux tarifs définitifs à l'association.
- 12/05/2027 : rappel si non validés.
- 14/05/2027 : solde variable, limite 22/05/2027.
- Rappels impayés deux jours avant chaque limite.
- L'acompte de 130 € ou l'avance de 390 € est payé lors de l'inscription ; les échéances 2 et 3 doivent être supprimées ou marquées payées pour ceux ayant déjà avancé 390 €.
