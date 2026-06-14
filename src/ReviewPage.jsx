import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

// ─────────────────────────────────────────────
// VECTOR51 — Admin Review Queue (#/review)
// Requires Supabase Auth (email/password user created in dashboard).
// Reads raw_reports(needs_review); publishes to reports, rejects, or
// merges the item's URL into an existing event.
// ─────────────────────────────────────────────

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const EVENT_TYPES = ["Light anomaly","UAP report","Drone cluster","Unknown aerial object"];
const SIGNALS = ["Low","Medium","High"];

const css = `
.v51r { min-height:100vh; background:#080C12; color:#D6E1EF; font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; padding:20px 16px 60px; }
.v51r * { box-sizing:border-box; }
.v51r-wrap { max-width:760px; margin:0 auto; }
.v51r h1 { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:500; margin:0 0 4px; }
.v51r-sub { font-size:11px; color:#6E7F94; margin:0 0 20px; }
.v51r-card { background:#0E141D; border:1px solid #1C2837; border-radius:8px; padding:14px 16px; margin-bottom:12px; }
.v51r-title { font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:500; line-height:1.4; margin-bottom:6px; }
.v51r-meta { font-size:10px; color:#FFB454; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
.v51r-ex { font-size:11px; color:#6E7F94; line-height:1.5; margin:0 0 10px; }
.v51r-ex a { color:#FFB454; }
.v51r-btns { display:flex; gap:8px; flex-wrap:wrap; }
.v51r button { font-family:inherit; font-size:11px; letter-spacing:0.06em; padding:7px 14px; border-radius:5px; border:1px solid #1C2837; background:#121A26; color:#D6E1EF; cursor:pointer; }
.v51r button:disabled { opacity:0.4; cursor:default; }
.v51r .pub { border-color:#3DBE7B66; color:#3DBE7B; }
.v51r .rej { border-color:#FF4D4D55; color:#FF8888; }
.v51r .mrg { border-color:#FFB45455; color:#FFB454; }
.v51r-form { margin-top:12px; padding-top:12px; border-top:1px solid #1C2837; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.v51r-form label { font-size:9px; color:#6E7F94; letter-spacing:0.1em; text-transform:uppercase; display:block; margin-bottom:3px; }
.v51r input, .v51r select, .v51r textarea { width:100%; font-family:inherit; font-size:12px; background:#080C12; border:1px solid #1C2837; color:#D6E1EF; border-radius:5px; padding:7px 9px; }
.v51r textarea { grid-column:1 / -1; resize:vertical; min-height:54px; }
.v51r-full { grid-column:1 / -1; }
.v51r-login { max-width:320px; margin:80px auto; display:flex; flex-direction:column; gap:10px; }
.v51r-err { font-size:11px; color:#FF8888; }
.v51r-top { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px; }
.v51r-count { color:#FFB454; }
`;

function PublishForm({ item, events, onDone }) {
  const guessDate = () => {
    const d = item.raw_date ? new Date(item.raw_date) : new Date();
    return isNaN(d) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  };
  const [f, setF] = useState({
  city: "", country: "US", state: item.raw_location || "",
  scope: "local",
  event_type: "UAP report", signal_level: "Low",
  observed_at: guessDate(), summary: item.raw_title || "",
});
  const [mergeId, setMergeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function publish() {
    if (f.scope === "local" && !f.city) { setErr("City is required for local reports."); return; }
    if (f.scope === "local" && f.country === "US" && !f.state) { setErr("State is required for US local reports."); return; }
    setBusy(true); setErr("");
    const { data, error } = await supabase.from("reports").insert({
      observed_at: `${f.observed_at}T12:00:00Z`,
      city: f.scope === "local" ? f.city : "National",
      country: f.country,
      state: f.scope === "local" ? f.state : null,
      scope: f.scope,
      domain: "aerial", source_name: item.source_name,
      source_class: item.source_class || "Media report",
      signal_level: f.signal_level, summary: f.summary, url: item.source_url,
    }).select("id").single();
    if (error) { setErr(error.message); setBusy(false); return; }
    const { error: e2 } = await supabase.from("raw_reports")
      .update({ ingestion_status: "published", published_report_id: data.id })
      .eq("id", item.id);
    if (e2) { setErr(e2.message); setBusy(false); return; }
    onDone();
  }

  async function merge() {
    if (!mergeId) { setErr("Pick an event to merge into."); return; }
    setBusy(true); setErr("");
    const { data: ev, error } = await supabase.from("events")
      .select("source_urls").eq("id", mergeId).single();
    if (error) { setErr(error.message); setBusy(false); return; }
    const urls = [...new Set([...(ev.source_urls || []), item.source_url].filter(Boolean))];
    const { error: e2 } = await supabase.from("events")
      .update({ source_urls: urls }).eq("id", mergeId);
    if (e2) { setErr(e2.message); setBusy(false); return; }
    const { error: e3 } = await supabase.from("raw_reports")
      .update({ ingestion_status: "merged" }).eq("id", item.id);
    if (e3) { setErr(e3.message); setBusy(false); return; }
    onDone();
  }

  return (
  <div className="v51r-form">
    <div className="v51r-full">
      <label>Country</label>
      <select value={f.country} onChange={set("country")}>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <option value="AU">Australia</option>
        <option value="BR">Brazil</option>
        <option value="MX">Mexico</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
        <option value="ES">Spain</option>
        <option value="IT">Italy</option>
        <option value="AR">Argentina</option>
        <option value="CL">Chile</option>
        <option value="CO">Colombia</option>
        <option value="PE">Peru</option>
        <option value="RU">Russia</option>
        <option value="JP">Japan</option>
        <option value="IN">India</option>
        <option value="ZA">South Africa</option>
        <option value="NZ">New Zealand</option>
        <option value="SV">El Salvador</option>
        <option value="OTHER">Other</option>
      </select>
    </div>
    <div className="v51r-full">
      <label>Scope</label>
        <select value={f.scope} onChange={set("scope")}>
        <option value="local">Local — specific location</option>
        <option value="national">National — no specific location</option>
        </select>
      </div>
    <div><label>City</label><input value={f.city} onChange={set("city")} placeholder="e.g. Sedona" /></div>
    <div><label>State {f.country !== "US" && <span style={{color:"#6E7F94",fontWeight:400}}>(optional)</span>}</label>
      <select value={f.state} onChange={set("state")}>
        <option value="">—</option>
        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
      <div><label>Event type</label>
        <select value={f.event_type} onChange={set("event_type")}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div><label>Signal</label>
        <select value={f.signal_level} onChange={set("signal_level")}>
          {SIGNALS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div><label>Observed (date)</label><input type="date" value={f.observed_at} onChange={set("observed_at")} /></div>
      <div><label>Merge target (optional)</label>
        <select value={mergeId} onChange={(e) => setMergeId(e.target.value)}>
          <option value="">— pick event —</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title.slice(0, 60)}</option>)}
        </select>
      </div>
      <div className="v51r-full"><label>Summary</label>
        <textarea value={f.summary} onChange={set("summary")} />
      </div>
      <div className="v51r-btns v51r-full">
        <button className="pub" disabled={busy} onClick={publish}>Publish report</button>
        <button className="mrg" disabled={busy || !mergeId} onClick={merge}>Merge into event</button>
        {err && <span className="v51r-err">{err}</span>}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(null);   // item id with publish form open
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function load() {
    const [{ data: raw }, { data: evs }] = await Promise.all([
      supabase.from("raw_reports").select("*")
        .eq("ingestion_status", "needs_review")
        .order("created_at", { ascending: false }).limit(100),
      supabase.from("events").select("id,title")
        .order("occurred_at", { ascending: false }).limit(25),
    ]);
    setItems(raw || []); setEvents(evs || []);
  }
  useEffect(() => { if (session) load(); }, [session]);

  async function login(e) {
    e.preventDefault(); setErr("");
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) setErr(error.message);
  }

  async function reject(id) {
    await supabase.from("raw_reports").update({ ingestion_status: "rejected" }).eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  }

  if (!supabase) return <div className="v51r"><style>{css}</style><div className="v51r-wrap"><p>Supabase env vars not configured.</p></div></div>;
  if (loading) return <div className="v51r"><style>{css}</style></div>;

  if (!session) {
    return (
      <div className="v51r"><style>{css}</style>
        <form className="v51r-login" onSubmit={login}>
          <h1>VECTOR51 // REVIEW</h1>
          <input type="email" placeholder="email" value={creds.email}
            onChange={(e) => setCreds({ ...creds, email: e.target.value })} />
          <input type="password" placeholder="password" value={creds.password}
            onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
          <button type="submit" className="pub">Sign in</button>
          {err && <span className="v51r-err">{err}</span>}
        </form>
      </div>
    );
  }

  return (
    <div className="v51r"><style>{css}</style>
      <div className="v51r-wrap">
        <div className="v51r-top">
          <div>
            <h1><span className="v51r-count">{items.length}</span> New Signals Awaiting Review</h1>
            <p className="v51r-sub">Publish maps it. Reject discards it. Merge attaches its URL to an existing event.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>

        {items.length === 0 && <p className="v51r-sub">Queue is empty. The ingestion job runs at 05:00 and 17:00 UTC.</p>}

        {items.map((item) => (
          <div key={item.id} className="v51r-card">
            <div className="v51r-meta">
              {item.source_name} &middot; {item.raw_location || "state unknown"} &middot; {item.raw_date || "no date"}
            </div>
            <div className="v51r-title">{item.raw_title}</div>
            <p className="v51r-ex">
              {(item.raw_text || "").slice(0, 220)}
              {item.source_url && <> <a href={item.source_url} target="_blank" rel="noopener noreferrer">Open article &rarr;</a></>}
            </p>
            <div className="v51r-btns">
              <button className="pub" onClick={() => setOpen(open === item.id ? null : item.id)}>
                {open === item.id ? "Close" : "Publish / Merge"}
              </button>
              <button className="rej" onClick={() => reject(item.id)}>Reject</button>
            </div>
            {open === item.id && (
              <PublishForm item={item} events={events}
                onDone={() => { setOpen(null); setItems(items.filter((i) => i.id !== item.id)); }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
