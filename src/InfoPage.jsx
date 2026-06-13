// Vector51 — InfoPage
// Covers: About, Terms of Use, Privacy Policy
// Accessible at #/about, #/terms, #/privacy (all render this page, jump to section)

import { useEffect } from "react";

const css = `
.v51i { min-height:100vh; background:#080C12; color:#D6E1EF; font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; }
.v51i * { box-sizing:border-box; }

.v51i-head { padding:18px 20px 14px; border-bottom:1px solid #1C2837; display:flex; align-items:flex-start; justify-content:space-between; }
.v51i-mark { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; letter-spacing:0.22em; }
.v51i-mark span { color:#FFB454; }
.v51i-tag { font-size:9px; color:#6E7F94; letter-spacing:0.18em; margin-top:3px; }

.v51i-nav { display:flex; gap:0; border-bottom:1px solid #1C2837; padding:0 20px; overflow-x:auto; }
.v51i-nav a { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#6E7F94; text-decoration:none; padding:12px 16px; border-bottom:2px solid transparent; white-space:nowrap; }
.v51i-nav a:hover { color:#D6E1EF; }
.v51i-nav a.active { color:#FFB454; border-bottom-color:#FFB454; }

.v51i-body { max-width:680px; margin:0 auto; padding:40px 20px 80px; }

.v51i-section { margin-bottom:56px; scroll-margin-top:20px; }
.v51i-eyebrow { font-size:10px; letter-spacing:0.24em; color:#FFB454; text-transform:uppercase; margin-bottom:8px; }
.v51i-h2 { font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:500; margin:0 0 20px; line-height:1.2; }
.v51i-p { font-size:13px; color:#A8B8CC; line-height:1.8; margin:0 0 16px; }
.v51i-p strong { color:#D6E1EF; font-weight:600; }
.v51i-p a { color:#FFB454; text-decoration:none; }
.v51i-p a:hover { text-decoration:underline; }
.v51i-divider { border:none; border-top:1px solid #1C2837; margin:40px 0; }
.v51i-pull { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:500; color:#D6E1EF; line-height:1.5; border-left:3px solid #FFB454; padding-left:18px; margin:28px 0; }
.v51i-list { font-size:13px; color:#A8B8CC; line-height:1.8; padding-left:0; list-style:none; margin:0 0 16px; }
.v51i-list li { padding-left:18px; position:relative; margin-bottom:6px; }
.v51i-list li::before { content:'—'; position:absolute; left:0; color:#FFB454; }

.v51i-foot { max-width:680px; margin:0 auto; padding:0 20px 40px; border-top:1px solid #1C2837; padding-top:24px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center; font-size:10px; color:#6E7F94; letter-spacing:0.06em; }
.v51i-foot a { color:#6E7F94; text-decoration:none; }
.v51i-foot a:hover { color:#D6E1EF; }
`;

const SECTIONS = [
  { id: "about", hash: "#/about", label: "About" },
  { id: "terms", hash: "#/terms", label: "Terms of Use" },
  { id: "privacy", hash: "#/privacy", label: "Privacy" },
];

export default function InfoPage({ initialHash }) {
  // Jump to the correct section when the page loads via a specific hash
  useEffect(() => {
    const map = { "#/about": "about", "#/terms": "terms", "#/privacy": "privacy" };
    const target = map[initialHash];
    if (target) {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [initialHash]);

  const activeHash = SECTION_FOR_HASH[initialHash] || "about";

  return (
    <div className="v51i">
      <style>{css}</style>

      <header className="v51i-head">
        <div>
          <div className="v51i-mark">VECTOR<span>51</span></div>
          <div className="v51i-tag">V0.3 — SIGNAL BOARD</div>
        </div>
        <a href="/" style={{ fontSize: 10, color: "#6E7F94", letterSpacing: "0.12em", textDecoration: "none" }}
          onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}>
          ← BACK
        </a>
      </header>

      <nav className="v51i-nav" aria-label="Info sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={s.hash}
            className={activeHash === s.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = s.hash.slice(1);
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
            }}>
            {s.label}
          </a>
        ))}
      </nav>

      <div className="v51i-body">

        {/* ── ABOUT ── */}
        <section id="about" className="v51i-section">
          <div className="v51i-eyebrow">About</div>
          <h2 className="v51i-h2">Anomaly intelligence.<br />Not belief. Pattern.</h2>

          <p className="v51i-p">
            Vector51 is an anomaly intelligence project focused on identifying patterns in publicly
            reported aerial phenomena, UAP activity, drone incidents, and related anomalous events
            across the United States.
          </p>
          <p className="v51i-p">
            We aggregate reports from public databases, news sources, community submissions, and
            government disclosures to identify emerging patterns and areas of elevated activity.
          </p>

          <div className="v51i-pull">
            We track signal, not truth.<br />We identify patterns, not conclusions.
          </div>

          <p className="v51i-p">
            Vector51 does not assert that any reported event is extraterrestrial, classified, or
            otherwise extraordinary in origin. We believe the data is interesting regardless of
            explanation.
          </p>
          <p className="v51i-p">
            The platform is built around a daily activity index — a signal score for each US state
            derived from recent report volume, source quality, and week-over-week change. States
            are assigned a tier: Quiet, Elevated, Active, or Hot Zone. These scores update every
            morning at 06:00 UTC.
          </p>
          <p className="v51i-p">
            Built by <a href="https://shotgunfungus.com" target="_blank" rel="noopener noreferrer">Shotgunfungus Labs</a>.
          </p>
        </section>

        <hr className="v51i-divider" />

        {/* ── TERMS ── */}
        <section id="terms" className="v51i-section">
          <div className="v51i-eyebrow">Terms of Use</div>
          <h2 className="v51i-h2">Use this information<br />with appropriate skepticism.</h2>

          <p className="v51i-p"><strong>Last updated: June 2026</strong></p>

          <p className="v51i-p">
            By accessing Vector51, you agree to these terms. If you don't agree, please don't use the site.
          </p>

          <p className="v51i-p"><strong>What Vector51 is</strong></p>
          <p className="v51i-p">
            Vector51 aggregates public anomalous-event reports for entertainment, research, and
            pattern exploration. It is an informational platform, not a news organization, government
            service, safety system, or scientific publication.
          </p>

          <p className="v51i-p"><strong>What the data is</strong></p>
          <ul className="v51i-list">
            <li>Reports are aggregated from public sources and may be incomplete, inaccurate, or unverified.</li>
            <li>Signal scores and activity tiers are editorial constructs, not scientific measurements.</li>
            <li>Forecasts are informational and entertainment-oriented. They are not predictions.</li>
            <li>Source attribution remains with original sources. Vector51 links to originals and does not reproduce full article content.</li>
            <li>Aggregated news content is summarized for reference. Original reporting credit belongs to the publishing outlet.</li>
          </ul>

          <p className="v51i-p"><strong>What you should not do</strong></p>
          <ul className="v51i-list">
            <li>Do not make safety, financial, governmental, or operational decisions based on Vector51 content.</li>
            <li>Do not treat signal scores or hot zone designations as verified intelligence.</li>
            <li>Do not reproduce Vector51's editorial content (signal scores, summaries, forecasts) without attribution.</li>
          </ul>

          <p className="v51i-p"><strong>Accuracy and liability</strong></p>
          <p className="v51i-p">
            Vector51 makes no guarantee of accuracy, completeness, or timeliness. The platform is
            provided as-is. Shotgunfungus Labs is not liable for decisions made based on information
            found here.
          </p>

          <p className="v51i-p"><strong>Changes</strong></p>
          <p className="v51i-p">
            These terms may be updated as the platform evolves. Continued use constitutes acceptance
            of the current terms.
          </p>
        </section>

        <hr className="v51i-divider" />

        {/* ── PRIVACY ── */}
        <section id="privacy" className="v51i-section">
          <div className="v51i-eyebrow">Privacy Policy</div>
          <h2 className="v51i-h2">We collect almost nothing.<br />Here's what we do collect.</h2>

          <p className="v51i-p"><strong>Last updated: June 2026</strong></p>

          <p className="v51i-p"><strong>Analytics</strong></p>
          <p className="v51i-p">
            Vector51 uses <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer">GoatCounter</a> for
            privacy-friendly analytics. GoatCounter does not use cookies, does not track individuals
            across sessions, and does not collect personal data. It counts page views and basic
            aggregate information (country, browser, screen size) without identifying you.
          </p>

          <p className="v51i-p"><strong>What we do not collect</strong></p>
          <ul className="v51i-list">
            <li>No accounts or logins (currently)</li>
            <li>No email addresses</li>
            <li>No cookies of any kind</li>
            <li>No advertising trackers</li>
            <li>No personal information</li>
          </ul>

          <p className="v51i-p"><strong>What we may collect in the future</strong></p>
          <p className="v51i-p">
            As Vector51 adds features — email alerts, watchlists, user submissions, accounts — this
            policy will be updated before those features launch. We'll collect only what's necessary
            to operate them and won't share it with third parties for advertising purposes.
          </p>

          <p className="v51i-p"><strong>Third-party links</strong></p>
          <p className="v51i-p">
            Reports link to original sources (news outlets, government sites, public databases).
            Vector51 is not responsible for the privacy practices of those sites.
          </p>

          <p className="v51i-p"><strong>Contact</strong></p>
          <p className="v51i-p">
            Questions about this policy: <a href="mailto:hello@vector51.com">hello@vector51.com</a>
          </p>
        </section>

      </div>

      <footer className="v51i-foot">
        <span>© 2026 Vector51 · A Shotgunfungus Labs Project</span>
        <span>
          <a href="#/about" onClick={(e) => { e.preventDefault(); window.location.hash="/about"; }}>About</a>
          {" · "}
          <a href="#/terms" onClick={(e) => { e.preventDefault(); window.location.hash="/terms"; }}>Terms</a>
          {" · "}
          <a href="#/privacy" onClick={(e) => { e.preventDefault(); window.location.hash="/privacy"; }}>Privacy</a>
        </span>
      </footer>
    </div>
  );
}

const SECTION_FOR_HASH = { "#/about": "about", "#/terms": "terms", "#/privacy": "privacy" };
