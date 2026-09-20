# École du dimanche

## Activer Supabase

Le site conserve son fonctionnement vitrine et son contenu de secours (`assets/content.json`), mais propose maintenant les comptes email, les avis et le suivi de visites. La configuration publique se trouve dans `assets/supabase-config.js`. Une clé **publishable/anon** peut être livrée au navigateur : l'obfuscation n'est pas une mesure de sécurité et aucune clé `service_role` ne doit être ajoutée au dépôt.

1. Dans le SQL Editor du projet Supabase, exécutez `schema.sql` (il crée les tables, index et politiques RLS).
2. Dans **Authentication → Providers**, activez Email. Choisissez la confirmation d'email selon votre besoin, puis ajoutez l'URL de production Vercel (et son URL de prévisualisation utile) dans **URL Configuration → Redirect URLs**.
3. L'adresse `carmelsindayihebura@gmail.com` est l'administrateur applicatif. Elle est reconnue par les policies RLS et voit le panneau de modération/visites après connexion. Pour changer l'administrateur, modifiez la constante dans `assets/app.js` et les policies dans `schema.sql`.
4. Servez le dossier avec un serveur HTTP (voir ci-dessous) : les modules Supabase et `content.json` ne fonctionnent pas correctement en `file://`.

Les visiteurs peuvent créer une ligne de visite mais la table `page_visits` n'est jamais lisible publiquement. Les avis publiés sont publics ; leur création/modération est protégée par RLS et les utilisateurs ne peuvent insérer qu'un avis portant leur propre `auth.uid()`. Le suivi (agent utilisateur, référent et identifiant de session) est limité à l'administration : informez les visiteurs, appliquez votre durée de conservation et vos obligations RGPD (base légale, droit d'accès/suppression, minimisation et éventuellement consentement cookies) selon votre juridiction. Le bouton d'inscription affiche un délai UX de 3 secondes avant de poursuivre.

Site vitrine **100 % statique**, en français, sans PHP ni MySQL. Le dirigeant,
les professeurs, leurs horaires du dimanche et la galerie sont chargés par
JavaScript depuis `assets/content.json`. Les données locales fournies sont
uniquement des exemples de démonstration.

## Modifier le contenu

`assets/content.json` est le fichier central. Le JSON n'accepte pas les
commentaires : voici la signification de chaque champ :

- `leader` : `name` (nom), `role` (fonction), `message` (message affiché) et
  `photo` (chemin de l'image).
- `teachers` : chaque objet contient `name`, `role`, `schedule` (horaire du
  dimanche), `bio` (courte biographie) et `photo`.
- `gallery` : chaque objet contient `title`, `category` (`activites` ou
  `celebrations`), `description` et `image` (chemin de l'image).

### Modifier le dirigeant

Ouvrez `assets/content.json` et modifiez les quatre valeurs de l'objet
`leader`, sans supprimer les guillemets ni les virgules JSON.

### Ajouter un professeur

Ajoutez un nouvel objet dans le tableau `teachers`, par exemple :

```json
{
  "name": "Marie N'Dri",
  "role": "Groupe des petits",
  "schedule": "Dimanche · 9 h 00 – 10 h 30",
  "bio": "Elle aime raconter des histoires.",
  "photo": "assets/teacher-marie.svg"
}
```

Le planning affiché se modifie donc simplement dans `schedule`.

### Publier une photo

1. Copiez l'image dans `assets/gallery/` (ou dans tout autre dossier du site).
2. Ajoutez un objet `gallery` dans `assets/content.json`, en indiquant son
   chemin dans `image`, par exemple `"image": "assets/gallery/sortie.jpg"`.
3. Vérifiez que `category` vaut `activites` ou `celebrations`.

Les SVG déjà présents dans `assets/` servent d'illustrations locales de
démonstration. Le chemin de chaque nouvelle image est configurable directement
dans le JSON.

## Tester localement

`fetch` peut être bloqué quand la page est ouverte directement en `file://`.
Lancez un serveur statique depuis la racine du projet :

```bash
npx serve .
# ou, avec Python :
python3 -m http.server 8000
```

Puis ouvrez l'URL indiquée (par exemple <http://localhost:8000>) dans le
navigateur. Le site affiche un état de chargement puis un message explicite si
`content.json` est absent ou invalide.

## Déployer sur Netlify

- **Netlify Drop :** glissez le dossier qui contient `index.html` sur
  <https://app.netlify.com/drop>.
- **Avec Git :** importez le dépôt dans Netlify, choisissez la racine comme
  dossier de publication et ne définissez aucune commande de build.

Aucun backend n'est requis : Netlify sert directement les fichiers statiques.
