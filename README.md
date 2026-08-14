# Pernod Yard Check — Manual Trailer Tracking

Companion to the main Pernod Ricard dwell tracker, for rental trailers that
don't have Samsara GPS trackers. A driver walks the yard 1-2x per shift,
adds each trailer they see + its load status, and submits the batch. This
feeds into the SAME sheets, sync'd with the same arrival/departure logic
as the GPS-tracked trailers — so the dispatch app, analytics, and daily
email all just include manually-tracked trailers automatically, tagged
"Manual" so you can tell them apart from GPS-confirmed ones.

## Honest limitation to know going in

GPS polls every 20 minutes; manual checks happen 1-2x per 10-hour shift.
That means dwell times for manually-tracked trailers have much wider
error bars — a trailer's "arrival time" is really "the first time someone
walking the yard happened to notice it," which could be hours after it
actually showed up. Fine for the big picture (is this trailer sitting for
days), not precise enough for minute-level disputes the way GPS data is.

## Setup steps

### 1. Backend (in the SAME Apps Script project as the main tracker)

- Replace `Config.gs`, `Setup.gs`, `DwellTracker.gs` with the updated
  versions, and add the new `ManualYardCheck.gs` file.
- Run `step10_setupManualCheckInfrastructure()` — creates the Manual Yard
  Checks log, the Trailer Registry (seeded with every trailer Samsara
  already knows, so GPS trailer numbers show up in the autocomplete too),
  and adds Tracking Method / Load Status columns to your existing sheets.
- **Check your shift hours**: `SHIFT_DAY_START_HOUR` / `SHIFT_DAY_END_HOUR`
  in `Config.gs` default to 6 AM–4 PM for Day Shift, everything else
  Evening Shift. Adjust to match reality — this is what auto-labels each
  check without anyone typing their name.

### 2. Deploy as a Web App

This is new — up to now everything's been read-only (published CSVs). The
check-in app needs to *write* data, which means a real Apps Script Web App
deployment:

1. In the Apps Script editor: **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (this doesn't expose your spreadsheet
   directly — it only allows calls to the specific doGet/doPost functions
   you wrote, which don't leak anything beyond the trailer number list)
5. Click **Deploy**, authorize if prompted
6. Copy the **Web app URL** — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`

### 3. Wire up the check-in app

Open `index.html` in the yard-check app, find:
```javascript
const WEB_APP_URL = 'PASTE_WEB_APP_URL_HERE';
```
paste in the URL from step 2, then push to GitHub Pages same as your other
apps. Have Robert (or whoever) add it to their home screen.

**If you ever redeploy** the Web App (not just edit and save — an actual
new deployment), you'll get a new URL and need to update this again. Using
"Manage deployments → Edit → new version" instead of a fresh deployment
keeps the same URL.

## How it works day to day

1. Walk the yard, type a trailer number (autocomplete suggests matches as
   you type), tap Empty or Loaded, tap "Add to This Check."
2. Repeat for every trailer you see.
3. Tap "Submit Yard Check" once — the whole batch goes in as one
   timestamp/shift.
4. A trailer not seen in **2 consecutive checks** gets logged as departed
   — so missing one trailer on a rushed walk-through doesn't falsely
   close it out; missing it twice in a row does.

## Trailer number consistency

The registry matches on a normalized key (spaces and dashes stripped,
uppercased) but stores and displays whatever spelling was entered FIRST.
So "T-1015", "t1015", and "T 1015" all resolve to one canonical entry —
but only if the driver picks it from the autocomplete rather than
free-typing a new variant each time. The autocomplete is the actual fix
here; it's there to make selecting the existing entry easier than typing
a new one.
