# Lead sink setup (optional, free)

The site works with no lead sink at all: every enquiry is stored in the visitor's browser and
handed off through WhatsApp / mailto with a pre-filled message. The optional sinks below add a
copy on the firm's side at zero cost.

## Google Sheets via Apps Script (recommended)

1. Create a Google Sheet with a tab `Leads` and header row:
   `ref, createdAt, type, name, phone, email, pincode, locality, budget, rooms, message, source, page`
2. Extensions → Apps Script. Paste:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
     const body = JSON.parse(e.postData.contents);
     const cols = [
       'ref',
       'createdAt',
       'type',
       'name',
       'phone',
       'email',
       'pincode',
       'locality',
       'budget',
       'rooms',
       'message',
       'source',
       'page',
     ];
     sheet.appendRow(cols.map((k) => (body[k] == null ? '' : String(body[k]).slice(0, 2000))));
     return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
       ContentService.MimeType.JSON,
     );
   }
   ```

3. Deploy → New deployment → Web app → Execute as _Me_, access _Anyone_. Copy the URL.
4. Set `NEXT_PUBLIC_LEAD_SHEETS_WEBAPP_URL=<url>` and rebuild.

The client posts with `mode: 'no-cors'`; the app treats network failure as non-fatal and still
completes the WhatsApp/mailto handoff. The endpoint is write-only and rate-limited by the
honeypot + time-trap guard on the client; add a shared secret column check if spam appears.

## Form relay (Web3Forms / Formspree free tier)

Set `NEXT_PUBLIC_LEAD_FORM_RELAY_ENDPOINT` and, if required, `NEXT_PUBLIC_LEAD_FORM_RELAY_KEY`.
The `FormRelaySink` posts the same JSON body.

## Ordering

`CompositeLeadSink` runs: LocalRecord → (Sheets) → (Relay) → WhatsApp/Mailto handoff. A failure in
any optional sink never blocks the confirmation page.
