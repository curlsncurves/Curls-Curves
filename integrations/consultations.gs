const HEADERS = ['Received at', 'Reference', 'Name', 'Phone', 'Email', 'Procedure', 'Consent', 'Notification'];

function doPost(event) {
  const fields = event && event.parameter || {};
  const name = String(fields.name || '').trim();
  const phone = String(fields.phone || '').trim();
  const email = String(fields.email || '').trim();
  const topic = String(fields.topic || '').trim();
  const digits = phone.replace(/\D/g, '');
  if (!event || event.contentLength > 4096 || fields.website || fields.consent !== 'on' ||
      name.length < 2 || name.length > 80 || phone.length > 32 || !/^\+?[\d ()-]+$/.test(phone) ||
      digits.length < 7 || digits.length > 15 || !/^[a-z0-9-]{1,120}$/.test(topic) ||
      email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return receipt_('Please check your details', 'Go back, check your details and consent, then try again.');
  }

  const config = PropertiesService.getScriptProperties();
  const spreadsheetId = config.getProperty('SPREADSHEET_ID');
  const recipient = config.getProperty('NOTIFICATION_EMAIL');
  const tabName = config.getProperty('SHEET_TAB') || 'Consultations';
  const unavailable = () => receipt_('Request could not be saved', 'Please try again or call the clinic.');
  if (!spreadsheetId || !recipient) return unavailable();

  const reference = Utilities.getUuid();
  let sheet;
  try {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return unavailable();
    try {
      const book = SpreadsheetApp.openById(spreadsheetId);
      sheet = book.getSheetByName(tabName) || book.insertSheet(tabName);
      if (!sheet.getLastRow()) sheet.appendRow(HEADERS);
      else if (String(sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]) !== String(HEADERS)) return unavailable();
      sheet.appendRow([new Date(), reference, literal_(name), literal_(phone), literal_(email), literal_(topic), 'Yes', 'Pending']);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
  } catch {
    return unavailable();
  }

  let notification = 'Sent';
  try {
    MailApp.sendEmail(recipient, 'New Curls & Curves consultation request',
      'A new request is waiting in the private consultations sheet.\nReference: ' + reference);
  } catch {
    notification = 'Failed';
    console.error('Consultation notification failed for reference ' + reference);
  }
  try {
    // Locate the reference again in case staff sorted the sheet during delivery.
    const cell = sheet.getRange('B:B').createTextFinder(reference).matchEntireCell(true).findNext();
    if (cell) sheet.getRange(cell.getRow(), HEADERS.length).setValue(notification);
  } catch {
    console.error('Could not update notification status for reference ' + reference);
  }
  return receipt_('Request received', 'The clinic can contact you to confirm availability. Reference: ' + reference);
}

function literal_(value) {
  return value ? "'" + value : '';
}

function receipt_(title, message) {
  return HtmlService.createHtmlOutput(
    '<style>body{font:16px/1.6 system-ui,sans-serif;background:#fff1f6;color:#201820;padding:24px}main{max-width:620px;margin:8vh auto;background:white;border:1px solid #eddbe3;border-radius:14px;padding:24px}a{color:#a00043}</style>' +
    '<main><h1>' + title + '</h1><p>' + message + '</p><p><a target="_top" href="https://curlsncurves.com/contact">Back to Curls &amp; Curves</a></p><p><a href="tel:+919480281652">Call the clinic</a></p></main>'
  ).setTitle(title).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
