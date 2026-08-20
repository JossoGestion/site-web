# JOSSO Gestion

Site vitrine de Vivien Josso, conseiller en gestion de patrimoine indépendant.
Astro, sans framework UI : le rendu est du HTML statique, aucune hydratation.

## Commandes

| Commande          | Effet                                        |
|-------------------|----------------------------------------------|
| `npm install`     | Installe les dépendances                     |
| `npm run dev`     | Serveur de développement sur localhost:4321  |
| `npm run build`   | Génère le site dans `dist/`                  |
| `npm run preview` | Sert `dist/` pour vérification avant mise en ligne |

## Où modifier quoi

| Contenu                                   | Fichier                                   |
|-------------------------------------------|-------------------------------------------|
| Téléphone, email, SIRET, LinkedIn, menu   | `src/data/site.js`                        |
| Avis clients                              | `src/data/testimonials.js`                |
| Questions fréquentes                      | `src/data/faq.js`                         |
| Blocs Particuliers / Entreprises          | `src/data/services.js`                    |
| Repères (45 min, 48 h…)                   | `src/data/stats.js`                       |
| Étapes de la méthode                      | `src/data/steps.js`                       |
| Textes du hero, biographie, contact       | `src/pages/index.astro`                   |
| Mentions légales                          | `src/pages/mentions-legales.astro`        |
| Politique de confidentialité              | `src/pages/politique-de-confidentialite.astro` |
| Styles                                    | `src/styles/global.css`                   |
| Interactions (menu, avis, formulaire)     | `src/scripts/site.js`                     |
| Images                                    | `public/assets/`                          |

L'en-tête, le pied de page et la barre d'action mobile sont dans
`src/components/` : une seule modification se répercute sur les trois pages.

## Reste à faire avant mise en ligne

Les mentions légales et la politique de confidentialité contiennent des
emplacements surlignés en jaune (`<mark class="todo">`) à renseigner par
Vivien Josso : adresse professionnelle, forme juridique, hébergeur, numéro
ORIAS, association professionnelle, assurance RCP, médiateur de la
consommation, crédits photo.

Le site charge ses polices depuis Google Fonts, ce qui transmet l'IP des
visiteurs à Google aux États-Unis. Les héberger localement supprimerait ce
transfert et le paragraphe correspondant de la politique de confidentialité.

## Déploiement

`dist/` est un dossier statique : il se dépose tel quel sur n'importe quel
hébergeur (Netlify, Vercel, OVH, FTP). Aucun serveur Node n'est requis.
