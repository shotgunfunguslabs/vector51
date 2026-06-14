// Vector51 ingestion job 1: Google News RSS -> raw_reports (needs_review)
// Runs in GitHub Actions. Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// No npm dependencies — plain fetch + a minimal RSS item parser.

import crypto from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const QUERIES = [
  '"UAP sighting"',
  '"unexplained lights"',
  '"strange lights" sky',
  '"drone swarm"',
  '"unidentified object" sky',
  '"mystery drone"',
];

const feedUrl = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;

// ── tiny RSS parsing (Google News RSS is flat and consistent) ──
const decode = (s) =>
  (s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

const stripTags = (s) => decode(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function field(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1] : "";
}

function parseItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    items.push({
      title: decode(field(b, "title")),
      link: decode(field(b, "link")),
      pubDate: decode(field(b, "pubDate")),
      source: decode(field(b, "source")) || "Google News",
      description: stripTags(field(b, "description")).slice(0, 1000),
    });
  }
  return items;
}

// ── best-effort US state detection from title/description ──
const STATES = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",
  Connecticut:"CT",Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",
  Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",
  Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",
  Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY",
  "North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",
  Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA",
  "West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
};

function detectState(text) {
  for (const [name, abbr] of Object.entries(STATES)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(text)) return abbr;
  }
  const m = text.match(/,\s*([A-Z]{2})\b/);
  if (m && Object.values(STATES).includes(m[1])) return m[1];
  return null;
}

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function run() {
  const rows = [];
  for (const q of QUERIES) {
    try {
      const res = await fetch(feedUrl(q), { headers: { "User-Agent": "Vector51/0.3 ingestion" } });
      if (!res.ok) { console.error(`feed failed (${res.status}): ${q}`); continue; }
      const xml = await res.text();
      const items = parseItems(xml);
      console.log(`${q}: ${items.length} items`);
      for (const it of items) {
        if (!it.title) continue;
        const normTitle = it.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
        const state = detectState(`${it.title} ${it.description}`);
        rows.push({
          source_name: it.source,
          source_class: "Media report",
          source_url: it.link,
          raw_title: it.title.slice(0, 300),
          raw_text: it.description,
          raw_date: it.pubDate,
          raw_location: state,
          raw_payload: { query: q, feed: "google-news-rss" },
          content_hash: hash(it.link || `${normTitle}|${it.source.toLowerCase()}`),
          ingestion_status: "needs_review",
          domain: "aerial",
        });
      }
    } catch (e) {
      console.error(`feed error: ${q}:`, e.message);
    }
  }

  // de-dupe within this batch (same article matches multiple queries)
  const seen = new Set();
  const unique = rows.filter((r) => !seen.has(r.content_hash) && seen.add(r.content_hash));
  console.log(`collected ${rows.length}, unique ${unique.length}`);
  if (unique.length === 0) return;

  // upsert with ignore-duplicates: rows already in the table are skipped silently
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/raw_reports?on_conflict=content_hash`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify(unique),
    }
  );
  if (!res.ok) {
    console.error("insert failed:", res.status, await res.text());
    process.exit(1);
  }
  console.log("insert ok");
}

run();
