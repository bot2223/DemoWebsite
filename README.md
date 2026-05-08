# Maison & Co. — Static Deploy

## Files
- `index.html` — single-file landing page (HTML + CSS + JS)
- `netlify.toml` — Netlify build config
- `netlify/functions/airtable-leads.js` — serverless function that posts to Airtable

## Deploy to Netlify (via GitHub)

1. Push this folder to a GitHub repo.
2. On Netlify: **Add new site → Import from GitHub** → select the repo.
3. Build settings auto-detected from `netlify.toml`:
   - Build command: *(none)*
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
4. **Site settings → Environment variables**, add:
   - `AIRTABLE_API_KEY` = your Airtable Personal Access Token (`patXXXX…`)
   - `AIRTABLE_BASE_ID` = your base ID (`appXXXX…`)
   - `AIRTABLE_TABLE` = your table name (e.g. `Leads`)
5. Deploy. Form posts to `/.netlify/functions/airtable-leads`.

## Required Airtable columns
`Name`, `Email`, `Phone`, `Type`, `Budget`, `Area`, `Timing`, `Date`, `Time`
