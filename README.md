# Skytower — præsentationswebsite

Premium one-pager for erhvervsdomicilet Skytower i Egådalen, Aarhus.
Bygget i vanilla HTML/CSS/JS — ingen build-step, ingen dependencies.

## Struktur

```
index.html          Al markup (semantisk, dansk) + SEO/delings-metadata
styles.css          Design tokens, layout, animationer (kommenteret)
fonts.css           @font-face for self-hostede fonte
script.js           Nav/scrollspy, scroll-reveal, parallax, lightbox, kopiér-e-mail
assets/images/      Web-optimerede billeder (JPEG + WebP), favicons, og-image
assets/fonts/       Fraunces + Inter som woff2 (ingen Google Fonts-opslag, GDPR-venligt)
robots.txt          Tillader crawling, peger på sitemap
sitemap.xml         Sitemap for forsiden
```

> Canonical-URL, Open Graph og sitemap antager domænet
> **https://skytower-aarhus.dk** (afledt af kontakt-e-mailen).
> Ret adresserne i `index.html`, `robots.txt` og `sitemap.xml`,
> hvis sitet skal ligge på et andet domæne.

## Kør lokalt

Enhver statisk server virker, fx:

```
npx serve .
```

## Deploy til Vercel

1. Push mappen til et GitHub-repo
2. Importér repoet på vercel.com — framework preset: **Other**, ingen build command, output directory: rodmappen
3. Deploy

## Kontakt

Kontaktsektionen og footeren linker til `mailto:kontakt@skytower-aarhus.dk`
— et klik åbner brugerens mailprogram med adressen udfyldt.
