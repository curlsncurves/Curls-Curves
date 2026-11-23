# Curls & Curves

Static React and Vite website for GitHub and Vercel. Google Apps Script receives consultation forms, saves requests in a private Google Sheet and emails clinic staff. Express is used only for local previews, including the optional private photo review.

## Run and verify locally

Use Node.js 24.

```powershell
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:4173. To serve the production build locally, run `npm run build` followed by `npm start`. The server binds to loopback by default. `HOST` and `PORT` control the listener.

## GitHub and Vercel deployment

1. Push the source to the clinic's GitHub repository. The workflow runs the tests and production build. Local records, gallery files and environment files are ignored by Git.
2. Follow [Google Apps Script setup](integrations/README.md) and set `VITE_CONSULTATION_SCRIPT_URL` in Vercel to the deployed Apps Script URL. Vite reads this public URL at build time. Use a separate script and sheet for preview testing if needed.
3. Import the repository into Vercel with the Vite preset and Node.js 24. The build publishes `dist/` with routing for direct page links. There are no Vercel Functions or database credentials to configure.
4. On the preview, submit a fictional consultation and check the confirmation page, sheet row and staff notification email. Verify that the private photo review endpoint returns 404.

## Clinic chatbot

The built-in assistant answers known questions, carries a procedure into follow-up questions, and links to the site's procedure catalog, blogs, patient guides, galleries, and contact options. Its callback form opens inside chat. Its conversation stays in browser memory and clears on refresh.

The default chat loads the same Kenyt widget ID published on the clinic's current website. Set `VITE_KENYT_BOT_ID` to an approved replacement ID when needed, or to `off` for the built-in assistant only. Kenyt must permit the intended domain. The built-in assistant remains available while the Kenyt launcher loads or when the embed fails. Kenyt's dialogue, lead collection, and any integrations are controlled in the clinic's Kenyt account. Test the configured widget on the hosted preview before launching.

Google Sheets delivery and email alerts for the Kenyt form require configuration in the clinic's Kenyt account.

## Private before-and-after review

Use `npm run preview:cases` to enable the review gallery on loopback after building. The private clinical images stay under `data/case-gallery` and are excluded from GitHub and Vercel. To regenerate them locally, install Python and Pillow, then run:

```powershell
python tools/import-case-gallery.py "path/to/approved-local-review-images"
npm run build
npm run preview:cases
```

Visit http://127.0.0.1:4173/before-after.php#case-comparisons. The importer preserves photo order and opaque masks and merges duplicate comparisons across the imported decks.

## Reference coverage

`REFERENCE-COVERAGE.json` records unavailable content and images from the public source capture. Some original blog links have no destination and some public imagery remains unavailable. The local review gallery is handled separately.
