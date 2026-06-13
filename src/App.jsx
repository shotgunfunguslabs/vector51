import { useEffect, useMemo, useState } from "react";
import ReviewPage from "./ReviewPage";
import { useSignalData } from "./hooks/useSignalData";
import { RISING_REGIONS, FORECAST } from "./mockData";

// ─────────────────────────────────────────────
// VECTOR51 — Signal Board v0.2
// Data-driven: everything renders from reports + signal_snapshots.
// ─────────────────────────────────────────────

const TILE = {
  AK: [0, 0], ME: [11, 0],
  VT: [10, 1], NH: [11, 1],
  WA: [1, 2], ID: [2, 2], MT: [3, 2], ND: [4, 2], MN: [5, 2], IL: [6, 2], WI: [7, 2], MI: [8, 2], NY: [9, 2], RI: [10, 2], MA: [11, 2],
  OR: [1, 3], NV: [2, 3], WY: [3, 3], SD: [4, 3], IA: [5, 3], IN: [6, 3], OH: [7, 3], PA: [8, 3], NJ: [9, 3], CT: [10, 3],
  CA: [1, 4], UT: [2, 4], CO: [3, 4], NE: [4, 4], MO: [5, 4], KY: [6, 4], WV: [7, 4], VA: [8, 4], MD: [9, 4], DE: [10, 4],
  AZ: [2, 5], NM: [3, 5], KS: [4, 5], AR: [5, 5], TN: [6, 5], NC: [7, 5], SC: [8, 5], DC: [9, 5],
  OK: [4, 6], LA: [5, 6], MS: [6, 6], AL: [7, 6], GA: [8, 6],
  HI: [0, 7], TX: [4, 7], FL: [9, 7],
};

const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "D.C.", FL: "Florida",
  GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const TIER_STYLE = {
  "Hot Zone": { color: "#FF4D4D", glow: "rgba(255,77,77,0.55)", hot: true },
  Active: { color: "#FF9A3D", glow: "rgba(255,154,61,0.45)", hot: false },
  Elevated: { color: "#F5C84B", glow: "rgba(245,200,75,0.35)", hot: false },
  Quiet: { color: "#3DBE7B", glow: "rgba(61,190,123,0.18)", hot: false },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.v51 {
  --bg: #080C12; --panel: #0E141D; --panel2: #121A26; --line: #1C2837;
  --text: #D6E1EF; --dim: #6E7F94; --amber: #FFB454;
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(255,154,61,0.05), transparent 60%), var(--bg);
  color: var(--text);
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  display: flex; flex-direction: column;
}
.v51 * { box-sizing: border-box; }
.v51-head { padding: 18px 20px 14px; border-bottom: 1px solid var(--line); display: flex; align-items: flex-start; justify-content: space-between; }
.v51-mark { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 0.22em; }
.v51-mark span { color: var(--amber); }
.v51-tag { font-size: 9px; color: var(--dim); letter-spacing: 0.18em; margin-top: 3px; }
.v51-status { font-size: 10px; color: var(--dim); display: flex; align-items: center; justify-content: flex-end; gap: 6px; letter-spacing: 0.12em; }
.v51-updated { font-size: 9px; color: var(--dim); letter-spacing: 0.1em; margin-top: 4px; }
.v51-dot { width: 6px; height: 6px; border-radius: 50%; background: #FF4D4D; animation: v51pulse 2s infinite; }
.v51-main { flex: 1; overflow-y: auto; padding: 20px 16px 96px; max-width: 720px; width: 100%; margin: 0 auto; }
.v51-eyebrow { font-size: 10px; letter-spacing: 0.24em; color: var(--amber); text-transform: uppercase; margin-bottom: 6px; }
.v51-h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 500; margin: 0 0 4px; letter-spacing: 0.01em; }
.v51-sub { font-size: 12px; color: var(--dim); margin: 0 0 20px; line-height: 1.5; }
.v51-map { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin-bottom: 16px; }
.v51-tile { aspect-ratio: 1; border-radius: 4px; border: 1px solid transparent; display: flex; align-items: center; justify-content: center; font-size: clamp(7px, 1.9vw, 11px); font-weight: 600; cursor: pointer; transition: transform 0.12s ease; background: var(--panel); color: var(--dim); font-family: inherit; }
.v51-tile:hover { transform: scale(1.12); }
.v51-tile:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
.v51-tile.hot { animation: v51pulse 1.8s infinite; }
.v51-tile.empty { background: transparent; cursor: default; pointer-events: none; border: none; }
@keyframes v51pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .v51-tile.hot, .v51-dot { animation: none; } .v51-tile:hover { transform: none; } }
.v51-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 10px; color: var(--dim); margin-bottom: 18px; letter-spacing: 0.06em; }
.v51-legend i { width: 9px; height: 9px; border-radius: 2px; display: inline-block; margin-right: 5px; vertical-align: -1px; }
.v51-detail { background: var(--panel2); border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.v51-detail h3 { font-family: 'Space Grotesk', sans-serif; font-size: 17px; margin: 0 0 2px; font-weight: 500; }
.v51-badge { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; padding: 2px 8px; border-radius: 3px; display: inline-block; }
.v51-card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
.v51-card-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; gap: 8px; }
.v51-card-loc { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 500; }
.v51-card-date { font-size: 10px; color: var(--dim); white-space: nowrap; }
.v51-card-meta { font-size: 10px; color: var(--amber); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.v51-card-sum { font-size: 12px; color: var(--dim); line-height: 1.55; margin: 0; }
.v51-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 12px; }
.v51-bar-label { width: 110px; flex-shrink: 0; }
.v51-bar-track { flex: 1; height: 8px; background: var(--panel); border-radius: 4px; overflow: hidden; }
.v51-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #F5C84B, #FF4D4D); }
.v51-bar-val { width: 48px; text-align: right; color: var(--amber); font-weight: 600; flex-shrink: 0; }
.v51-section { margin-bottom: 28px; }
.v51-section h2 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); margin: 0 0 12px; }
.v51-fc { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--amber); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
.v51-fc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.v51-fc-region { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 500; }
.v51-fc-text { font-size: 12px; color: var(--dim); line-height: 1.55; margin: 0; }
.v51-foot { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 10px; color: var(--dim); line-height: 1.6; letter-spacing: 0.02em; }
.v51-tabs { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(8,12,18,0.92); backdrop-filter: blur(12px); border-top: 1px solid var(--line); display: flex; justify-content: space-around; padding: 10px 8px calc(10px + env(safe-area-inset-bottom)); }
.v51-tab { background: none; border: none; color: var(--dim); cursor: pointer; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 12px; border-radius: 6px; }
.v51-tab.on { color: var(--amber); background: rgba(255,180,84,0.08); }
.v51-tab:focus-visible { outline: 2px solid var(--amber); }
`;

const GRID = [];
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 12; c++) {
    const abbr = Object.keys(TILE).find((k) => TILE[k][0] === c && TILE[k][1] === r);
    GRID.push(abbr || null);
  }
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const fmtUpdated = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).toUpperCase();
  const time = d.toISOString().slice(11, 16);
  return `UPDATED ${date} \u00B7 ${time} UTC`;
};

function MapPage({ snapshotsByState, hotStates, reports, selected, setSelected }) {
  const sel = selected ? snapshotsByState[selected] : null;
  const selReports = selected ? reports.filter((r) => r.state === selected) : [];
  const hotLabel =
    hotStates.length > 0
      ? `${hotStates.length} hot zone${hotStates.length === 1 ? "" : "s"} detected. Activity clustering across ${hotStates
          .map((s) => STATE_NAMES[s])
          .join(", ")}.`
      : "No hot zones detected. National activity is within baseline range.";

  return (
    <div>
      <div className="v51-eyebrow">Signal map</div>
      <h1 className="v51-h1">Something is happening.</h1>
      <p className="v51-sub">Public report activity index across all 50 states. Tap a state for detail.</p>

      <div className="v51-map" role="group" aria-label="US anomaly activity map">
        {GRID.map((abbr, i) => {
          if (!abbr) return <div key={i} className="v51-tile empty" aria-hidden="true" />;
          const snap = snapshotsByState[abbr];
          const score = snap?.activity_score ?? 0;
          const t = TIER_STYLE[snap?.tier ?? "Quiet"];
          const isSel = selected === abbr;
          return (
            <button
              key={abbr}
              className={`v51-tile ${t.hot ? "hot" : ""}`}
              aria-label={`${STATE_NAMES[abbr]}: ${snap?.tier ?? "Quiet"}`}
              onClick={() => setSelected(isSel ? null : abbr)}
              style={{
                background: `${t.color}22`,
                color: t.color,
                borderColor: isSel ? t.color : `${t.color}44`,
                boxShadow: `0 0 ${score / 6}px ${t.glow}`,
              }}
            >
              {abbr}
            </button>
          );
        })}
      </div>

      <div className="v51-legend">
        <span><i style={{ background: "#3DBE7B" }} />Quiet</span>
        <span><i style={{ background: "#F5C84B" }} />Elevated</span>
        <span><i style={{ background: "#FF9A3D" }} />Active</span>
        <span><i style={{ background: "#FF4D4D" }} />Hot Zone</span>
      </div>

      <div className="v51-detail">
        <h3>National Signal</h3>
        <p className="v51-card-sum" style={{ marginTop: 6 }}>{hotLabel}</p>
      </div>

      {sel && (
        <div className="v51-detail">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3>{STATE_NAMES[selected]}</h3>
            <span
              className="v51-badge"
              style={{
                color: TIER_STYLE[sel.tier].color,
                background: `${TIER_STYLE[sel.tier].color}1A`,
                border: `1px solid ${TIER_STYLE[sel.tier].color}55`,
              }}
            >
              {sel.tier} &middot; {sel.activity_score}
            </span>
          </div>
          {selReports.length > 0 ? (
            selReports.map((r) => (
              <p key={r.id} className="v51-card-sum" style={{ marginBottom: 8 }}>
                <span style={{ color: "var(--amber)" }}>{fmtDate(r.observed_at)} &mdash; {r.city}.</span> {r.summary}
              </p>
            ))
          ) : (
            <p className="v51-card-sum">No reports in the current window. Activity index reflects regional baseline only.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsPage({ reports }) {
  return (
    <div>
      <div className="v51-eyebrow">Latest reports</div>
      <h1 className="v51-h1">Incoming signals</h1>
      <p className="v51-sub">{reports.length} reports in the current window, newest first.</p>
      {reports.map((r) => (
        <div key={r.id} className="v51-card">
          <div className="v51-card-top">
            <span className="v51-card-loc">{r.city}, {r.state}</span>
            <span className="v51-card-date">{fmtDate(r.observed_at)}</span>
          </div>
          <div className="v51-card-meta">
            {r.event_type} &middot; {r.source_class} &middot; {r.source_name} &middot; Signal: {r.signal_level}
          </div>
          <p className="v51-card-sum">
            {r.summary}
            {r.url && (
              <>
                {" "}
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>Source &rarr;</a>
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

function TrendsPage({ snapshots, reports }) {
  const topStates = [...snapshots]
    .filter((s) => (s.change_7d_pct ?? 0) > 0)
    .sort((a, b) => b.change_7d_pct - a.change_7d_pct)
    .slice(0, 5);
  const maxChange = Math.max(1, ...topStates.map((s) => s.change_7d_pct));

  const mix = Object.entries(
    reports.reduce((acc, r) => ((acc[r.event_type] = (acc[r.event_type] || 0) + 1), acc), {})
  )
    .map(([type, n]) => ({ type, pct: Math.round((n / Math.max(1, reports.length)) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  const maxPct = Math.max(1, ...mix.map((e) => e.pct));

  return (
    <div>
      <div className="v51-eyebrow">7-day trends</div>
      <h1 className="v51-h1">Where it&rsquo;s heating up</h1>
      <p className="v51-sub">Week-over-week change in report volume.</p>

      <div className="v51-section">
        <h2>Top states this week</h2>
        {topStates.map((s) => (
          <div key={s.state} className="v51-bar-row">
            <span className="v51-bar-label">{STATE_NAMES[s.state]}</span>
            <div className="v51-bar-track">
              <div className="v51-bar-fill" style={{ width: `${(s.change_7d_pct / maxChange) * 100}%` }} />
            </div>
            <span className="v51-bar-val">+{Math.round(s.change_7d_pct)}%</span>
          </div>
        ))}
      </div>

      <div className="v51-section">
        <h2>Fastest rising regions</h2>
        {RISING_REGIONS.map((r) => (
          <div key={r.region} className="v51-card">
            <div className="v51-card-top">
              <span className="v51-card-loc">{r.region}</span>
              <span style={{ color: "var(--amber)", fontWeight: 600, fontSize: 13 }}>+{r.change}%</span>
            </div>
            <p className="v51-card-sum">{r.note}</p>
          </div>
        ))}
      </div>

      <div className="v51-section">
        <h2>Most common event type</h2>
        {mix.map((e) => (
          <div key={e.type} className="v51-bar-row">
            <span className="v51-bar-label" style={{ width: 160, fontSize: 11 }}>{e.type}</span>
            <div className="v51-bar-track">
              <div className="v51-bar-fill" style={{ width: `${(e.pct / maxPct) * 100}%`, background: "linear-gradient(90deg,#3DBE7B,#F5C84B)" }} />
            </div>
            <span className="v51-bar-val">{e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForecastPage() {
  const arrow = { up: "\u25B2", down: "\u25BC", flat: "\u25A0" };
  const color = { up: "#FF9A3D", down: "#3DBE7B", flat: "#6E7F94" };
  return (
    <div>
      <div className="v51-eyebrow">14-day outlook</div>
      <h1 className="v51-h1">Anomaly forecast</h1>
      <p className="v51-sub">Pattern-based regional outlook. Not a prediction &mdash; a forecast of reporting conditions.</p>
      {FORECAST.map((f) => (
        <div key={f.region} className="v51-fc" style={{ borderLeftColor: color[f.dir] }}>
          <div className="v51-fc-top">
            <span className="v51-fc-region">{f.region}</span>
            <span style={{ color: color[f.dir], fontSize: 11, letterSpacing: "0.12em" }}>
              {arrow[f.dir]} {f.level.toUpperCase()}
            </span>
          </div>
          <p className="v51-fc-text">{f.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [selected, setSelected] = useState("NV");
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const { reports, snapshots, updatedAt, isMock } = useSignalData();

  const snapshotsByState = useMemo(
    () => Object.fromEntries(snapshots.map((s) => [s.state, s])),
    [snapshots]
  );
  const nationalDelta = useMemo(() => {
  const active = snapshots.filter((s) => s.activity_score >= 25);
  if (active.length === 0) return 0;
  return Math.round(
    active.reduce((sum, s) => sum + (Number(s.change_7d_pct) || 0), 0) / active.length
  );
}, [snapshots]);

  const hotStates = useMemo(
    () => snapshots.filter((s) => s.tier === "Hot Zone").map((s) => s.state),
    [snapshots]
  );

  if (route === "#/review") return <ReviewPage />;

  return (
    <div className="v51">
      <style>{css}</style>
      <header className="v51-head">
        <div>
          <div className="v51-mark">VECTOR<span>51</span></div>
          <div className="v51-tag">V0.2 &mdash; SIGNAL BOARD{isMock ? " \u00B7 SAMPLE DATA" : ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="v51-status"><span className="v51-dot" />{hotStates.length} HOT ZONES</div>
          <div className="v51-status" style={{ marginTop: 2 }}>
            <span style={{ color: nationalDelta >= 0 ? "#FF9A3D" : "#3DBE7B" }}>
              {nationalDelta >= 0 ? "\u25B2" : "\u25BC"} NATIONAL SIGNAL {nationalDelta >= 0 ? "+" : ""}{nationalDelta}%
            </span>
          </div>
          <div className="v51-updated">{fmtUpdated(updatedAt)}</div>
        </div>
      </header>

      <main className="v51-main">
        {tab === "map" && (
          <MapPage
            snapshotsByState={snapshotsByState}
            hotStates={hotStates}
            reports={reports}
            selected={selected}
            setSelected={setSelected}
          />
        )}
        {tab === "reports" && <ReportsPage reports={reports} />}
        {tab === "trends" && <TrendsPage snapshots={snapshots} reports={reports} />}
        {tab === "forecast" && <ForecastPage />}
        <footer className="v51-foot">
          Vector51 aggregates public anomalous-event reports for entertainment, research, and pattern exploration. Reports are unverified unless otherwise noted.
        </footer>
      </main>

      <nav className="v51-tabs" aria-label="Pages">
        {[
          ["map", "Signal Map"],
          ["reports", "Reports"],
          ["trends", "Trends"],
          ["forecast", "Forecast"],
        ].map(([key, label]) => (
          <button key={key} className={`v51-tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
