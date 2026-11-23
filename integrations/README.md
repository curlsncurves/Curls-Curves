# Google Sheets and email notifications

1. Open the clinic's private Google Sheet. Under **Extensions → Apps Script**, paste the contents of [consultations.gs](consultations.gs) into the script editor.
2. Under **Project Settings → Script properties**, set `SPREADSHEET_ID` to the Sheet ID from its URL and `NOTIFICATION_EMAIL` to the clinic inbox that should receive alerts. Optionally set `SHEET_TAB` to a dedicated tab name. The default is `Consultations`. The script creates the tab and headers if needed.
3. Select **Deploy → New deployment → Web app**. Run it as the deploying clinic account and select **Anyone** for visitor access. Authorize Sheets and email access. Keep access to the spreadsheet itself restricted to clinic staff.
4. Copy the deployed `/exec` URL to `VITE_CONSULTATION_SCRIPT_URL` in Vercel and redeploy. For local testing, set the same variable in `.env.local` and restart Vite. The website sends the form directly to Apps Script, which displays the receipt after saving it.
5. Submit a fictional request from the Vercel preview. Match the receipt reference against the sheet and confirm the alert arrives. If mail delivery throws an error, the saved row is marked `Failed`. A `Pending` row may need checking against the Apps Script execution log.

Email alerts contain a reference only. Contact information stays in the sheet. The Kenyt chatbot's separate lead form is managed by Kenyt.
