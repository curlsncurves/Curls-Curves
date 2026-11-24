# Curls & Curves

Static React and Vite website for GitHub and Vercel. Google Apps Script receives consultation forms, saves requests in a private Google Sheet and emails clinic staff.

## Run and verify locally

Use Node.js 24.

```powershell
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:4173. To preview the production build locally, run `npm run build` followed by `npm start`. Both commands bind Vite to loopback.

## GitHub and Vercel deployment

1. Push the source to the clinic's GitHub repository. The workflow runs the tests and production build. Local records, gallery files and environment files are ignored by Git.
2. Follow [Google Apps Script setup](integrations/README.md) and set `VITE_CONSULTATION_SCRIPT_URL` in Vercel to the deployed Apps Script URL. Vite reads this public URL at build time. Use a separate script and sheet for preview testing if needed.
3. Import the repository into Vercel with the Vite preset and Node.js 24. The build publishes `dist/` with routing for direct page links. There are no Vercel Functions or database credentials to configure.
4. On the preview, submit a fictional consultation and check the confirmation page, sheet row and staff notification email.

## Search indexing

The Vite build renders each supported public route into HTML and generates `sitemap.xml` and `robots.txt`. Run `npm run sync:routes` after changing public routes, then run `npm run build` and `npm run check:seo`.

Canonical URLs use `https://curlsncurves.com`. After production deployment, verify the domain in Google Search Console, submit `/sitemap.xml`, and inspect the homepage, a procedure page and a blog article. Confirm that Google's reported canonical is on the production domain.

## Clinic chatbot

The built-in assistant answers known questions, carries a procedure into follow-up questions, and links to the site's procedure catalog, blogs, patient guides, galleries, and contact options. Its callback form opens inside chat. Its conversation stays in browser memory and clears on refresh.

The chatbot runs in the browser without a subscription or external chatbot service. Its callback form uses the same Apps Script URL as the contact page.

## Private before-and-after review

Private clinical images stay under `data/case-gallery` and are excluded from GitHub and Vercel. The website uses its existing public before-and-after pages. For offline review preparation, install Python and Pillow, then run:

```powershell
python tools/import-case-gallery.py "path/to/approved-local-review-images"
```

The importer preserves photo order and opaque masks and merges duplicate comparisons across the imported decks.

With a production build present, run `npm run preview:gallery` and open `http://127.0.0.1:4173/before-after.php` to review the local comparisons. This preview reads the images directly from the local folder on loopback. The normal preview and Vercel build exclude those files.

## Reference coverage

`REFERENCE-COVERAGE.json` records unavailable content and images from the public source capture. Some original blog links have no destination and some public imagery remains unavailable. The local review gallery is handled separately.
