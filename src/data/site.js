// Coordonnées et identité : une seule source pour tout le site.
export const site = {
  name: 'JOSSO Gestion',
  baseline: 'Conseil indépendant en gestion de patrimoine · Particuliers & entreprises',
  baselineShort: 'Conseil indépendant en gestion de patrimoine',
  phone: '06 89 90 71 16',
  phoneHref: 'tel:+33689907116',
  email: 'jossogestion@gmail.com',
  // Réservation Cal.com. URL volontairement sans paramètres : le lien
  // fourni contenait date=2026-08-28, qui figerait le calendrier.
  booking: 'https://cal.com/vivien-josso-ysii7v/rendez-vous-de-45-minutes',
  // Clé publique Web3Forms : achemine le formulaire de contact vers la
  // boîte de Vivien. Visible dans le code source, c'est normal.
  web3formsKey: 'a35c8e93-ed59-4815-a50c-ef4a5422ae94',
  linkedin: 'https://www.linkedin.com/in/vivien-josso/',
  instagram: 'https://www.instagram.com/jossogestion',
  siret: '533 230 652 00018',
  legalUpdated: '19 août 2026',
};

export const nav = [
  { href: '/#services', label: 'Services' },
  { href: '/#methode', label: 'Méthode' },
  { href: '/#avis', label: 'Avis' },
  { href: '/#faq', label: 'FAQ' },
];

// Le menu mobile ajoute une entrée que la barre bureau ne porte pas.
export const navMobile = [
  ...nav.slice(0, 3),
  { href: '/#apropos', label: 'Qui vous accompagne' },
  nav[3],
];
