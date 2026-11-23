# Curls & Curves

React and Vite frontend with Express and SQLite for local development. The same consultation validation runs in a Vercel Node.js function backed by Neon Postgres. The site includes procedure pages, local clinical review galleries, and a built-in clinic assistant.

## Run and verify locally

Use Node.js 24.

```powershell
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:4173. To serve the production build locally, run `npm run build` followed by `npm start`. The server binds to loopback by default. `HOST` and `PORT` control the listener.

The local API stores consultation requests in `data/consultations.sqlite`. Use `npm run requests` on the local server to view the newest records. When setting `DATA_DIR`, use the same value for the server and staff command. A callback request does not confirm an appointment. No email or SMS notification is configured.

## GitHub and Vercel deployment

1. Push the project source to a GitHub repository that the clinic controls. The included workflow installs dependencies, runs the chatbot and consultation tests, and builds the frontend. Git ignores local enquiries, private gallery files, source captures, generated builds and environment files. `.env.example` contains placeholders only.
2. Import that repository into Vercel with the Vite preset and Node.js 24. The checked-in `vercel.json` points to the `dist` build and routes direct page links and the consultation API.
3. Provision a Neon Postgres database in Vercel Marketplace or attach an existing clinic-controlled Neon project. Apply `db/001-consultations.sql` using the Neon SQL editor. Set the server-only `DATABASE_URL` in Vercel for the relevant environments. Use separate Preview and Production databases or branches when possible.
4. Deploy a preview and check that `/api/health` reports `consultationsConfigured: true`. This reports configuration only. Submit a fictional consultation and confirm that its reference appears in the hosted `consultations` table. Open a procedure and blog article directly, verify an old blog URL redirects, check the chat widget, and confirm that `/api/case-gallery` returns 404. Once approved, promote the deployment or connect the clinic's domain.

Authorized staff can retrieve hosted consultation requests through the protected Neon console or a clinic-approved database tool. The website exposes no public endpoint for reading stored requests. Existing SQLite records are separate from the hosted database.

## Clinic chatbot

The built-in assistant answers known questions, carries a procedure into follow-up questions, and links to the site's procedure catalog, blogs, patient guides, galleries, and contact options. Its callback form opens inside chat. Its conversation stays in browser memory and clears on refresh.

The default chat loads the same Kenyt widget ID published on the clinic's current website. Set `VITE_KENYT_BOT_ID` to an approved replacement ID when needed, or to `off` for the built-in assistant only. Kenyt must permit the intended domain. The built-in assistant remains available while the Kenyt launcher loads or when the embed fails. Kenyt's dialogue, lead collection, and any integrations are controlled in the clinic's Kenyt account. Test the configured widget on the hosted preview before launching.

Google Sheets delivery and email alerts for the Kenyt form require configuration in the clinic's Kenyt account. `DATABASE_URL` applies to the website's own callback form.

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
