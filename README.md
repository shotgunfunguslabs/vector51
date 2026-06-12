# Vector51 — Signal Board (v0.2)

Public anomaly signal board. State-level activity index, report feed, trends, 14-day outlook.

Runs in two modes:
- **No env vars** → built-in sample data, header shows "SAMPLE DATA"
- **Supabase env vars set** → live data from `reports` + `signal_snapshots`

## Local dev

```
npm install
npm run dev
```

## Supabase setup

1. Create a project at supabase.com
2. SQL editor → run `supabase/schema.sql`
3. SQL editor → run `supabase/seed.sql` (sample data; replace as real data arrives)
4. Settings → API → copy Project URL and anon public key
5. `cp .env.example .env` and fill in both values

## Deploy to Netlify

1. Push this folder to a GitHub repo
2. Netlify → Add new site → Import from Git → pick the repo
   (build command and publish dir come from `netlify.toml`)
3. Site settings → Environment variables → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Daily update ritual (the actual MVP work)

Each morning, in the Supabase table editor or SQL editor:

1. Insert new rows into `reports` for anything found in NUFORC, MUFON, Reddit, news
2. Insert one `signal_snapshots` row **per state** with today's `snapshot_at`
   (states you skip keep yesterday's values via the `latest_signal_snapshots` view,
   but inserting all 50 keeps `change_7d_pct` honest)
3. The "UPDATED" timestamp in the header derives from the newest snapshot —
   no code change needed

Scores are editorial for now. A simple starting formula:
`activity_score = min(100, report_count_7d * 12 + recency_bonus)` — tune by feel.

## Source class hierarchy

`Community report` → `Public report` → `Media report` → `Agency-confirmed` → `Multi-source signal`

Enforced by a check constraint on `reports.source_class`. Reserve the top two
tiers for genuinely corroborated events so the labels keep meaning.
