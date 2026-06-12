// Mock data in v0.2 schema shape. Used when Supabase env vars are absent
// or queries fail/return empty. Field names mirror the database exactly.

export const MOCK_REPORTS = [
  { id: "m01", observed_at: "2026-06-10T04:10:00Z", city: "Tonopah", state: "NV", lat: 38.0672, lng: -117.2301, event_type: "Light anomaly", source_name: "NUFORC", source_class: "Public report", signal_level: "Medium", summary: "Three amber orbs in triangular formation, stationary for 6 minutes before fading.", url: null },
  { id: "m02", observed_at: "2026-06-10T02:45:00Z", city: "Sedona", state: "AZ", lat: 34.8697, lng: -111.7610, event_type: "UAP report", source_name: "Reddit r/UFOs", source_class: "Community report", signal_level: "Low", summary: "Silent metallic object moving against wind direction, photographed by two witnesses.", url: null },
  { id: "m03", observed_at: "2026-06-09T05:30:00Z", city: "Roswell", state: "NM", lat: 33.3943, lng: -104.5230, event_type: "Drone cluster", source_name: "Local news", source_class: "Media report", signal_level: "High", summary: "12+ unidentified drones over ranchland, FAA confirms no registered flights.", url: null },
  { id: "m04", observed_at: "2026-06-09T03:15:00Z", city: "Las Vegas", state: "NV", lat: 36.1699, lng: -115.1398, event_type: "Unknown aerial object", source_name: "MUFON", source_class: "Public report", signal_level: "Medium", summary: "Fast-moving object with no transponder tracked briefly on hobbyist radar.", url: null },
  { id: "m05", observed_at: "2026-06-08T06:00:00Z", city: "Joshua Tree", state: "CA", lat: 34.1347, lng: -116.3131, event_type: "Light anomaly", source_name: "Direct submission", source_class: "Public report", signal_level: "Low", summary: "Pulsing white light descending vertically, no aircraft sound.", url: null },
  { id: "m06", observed_at: "2026-06-08T04:20:00Z", city: "Marfa", state: "TX", lat: 30.3095, lng: -104.0204, event_type: "Light anomaly", source_name: "NUFORC", source_class: "Public report", signal_level: "Medium", summary: "Classic Marfa lights activity, unusually bright, multiple independent reports.", url: null },
  { id: "m07", observed_at: "2026-06-07T05:50:00Z", city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.0740, event_type: "UAP report", source_name: "Reddit r/UFOs", source_class: "Community report", signal_level: "Low", summary: "V-shaped formation of lights, reminiscent of 1997 event, 4 witnesses.", url: null },
  { id: "m08", observed_at: "2026-06-07T03:40:00Z", city: "Colorado Springs", state: "CO", lat: 38.8339, lng: -104.8214, event_type: "Drone cluster", source_name: "Local news", source_class: "Media report", signal_level: "High", summary: "Repeated nighttime drone swarms near military installation, under investigation.", url: null },
  { id: "m09", observed_at: "2026-06-06T02:30:00Z", city: "Taos", state: "NM", lat: 36.4072, lng: -105.5731, event_type: "Unknown aerial object", source_name: "MUFON", source_class: "Public report", signal_level: "Medium", summary: "Disc-shaped object hovering near mountain ridge at dusk, 2-minute video.", url: null },
  { id: "m10", observed_at: "2026-06-06T07:10:00Z", city: "Reno", state: "NV", lat: 39.5296, lng: -119.8138, event_type: "Light anomaly", source_name: "Direct submission", source_class: "Public report", signal_level: "Low", summary: "Green flash followed by slow-moving orb, ruled out as meteor by witness.", url: null },
  { id: "m11", observed_at: "2026-06-05T04:00:00Z", city: "Mount Rainier", state: "WA", lat: 46.8523, lng: -121.7603, event_type: "UAP report", source_name: "NUFORC", source_class: "Public report", signal_level: "Medium", summary: "Nine reflective objects skipping across the sky near the summit.", url: null },
  { id: "m12", observed_at: "2026-06-04T01:55:00Z", city: "Gulf Breeze", state: "FL", lat: 30.3571, lng: -87.1638, event_type: "Light anomaly", source_name: "MUFON", source_class: "Public report", signal_level: "Low", summary: "Red light hovering over water, splitting into two before disappearing.", url: null },
];

// Activity score 0-100 per state for the mock snapshot set.
const ACTIVITY = {
  NV: 91, AZ: 78, NM: 72, CA: 64, TX: 58, CO: 52, UT: 49, FL: 47,
  WA: 44, OR: 38, OH: 36, PA: 34, NY: 33, MT: 31, ID: 29, NC: 28,
  MI: 26, IL: 24, GA: 22, VA: 21, TN: 19, MO: 18, WI: 16, MN: 15,
  OK: 14, KS: 13, AK: 13, SC: 12, IN: 12, MA: 11, NJ: 11, MD: 10,
  KY: 10, AL: 9, LA: 9, AR: 8, IA: 8, NE: 7, WY: 12, SD: 6, ND: 6,
  MS: 6, WV: 5, CT: 5, NH: 5, VT: 4, ME: 7, RI: 3, DE: 3, HI: 9, DC: 4,
};

const CHANGE_7D = { NV: 42, AZ: 31, NM: 18, CO: 12, TX: 9, CA: 6, WA: 4, FL: -3, OH: -8, IL: -11, MN: -14, MO: -9 };
const COUNT_7D = { NV: 3, AZ: 2, NM: 2, CA: 1, TX: 1, CO: 1, WA: 1, FL: 1 };

export function tierFor(score) {
  if (score >= 70) return "Hot Zone";
  if (score >= 45) return "Active";
  if (score >= 25) return "Elevated";
  return "Quiet";
}

export const MOCK_SNAPSHOT_AT = "2026-06-11T06:00:00Z";

export const MOCK_SNAPSHOTS = Object.entries(ACTIVITY).map(([state, score]) => ({
  id: `s-${state}`,
  snapshot_at: MOCK_SNAPSHOT_AT,
  state,
  activity_score: score,
  tier: tierFor(score),
  report_count_7d: COUNT_7D[state] ?? 0,
  change_7d_pct: CHANGE_7D[state] ?? 0,
}));

// Editorial content: authored, not derived. Fine to keep static through v0.2.
export const RISING_REGIONS = [
  { region: "Mojave Corridor", note: "NV-CA border", change: 38 },
  { region: "Four Corners", note: "AZ-NM-CO-UT", change: 24 },
  { region: "Front Range", note: "Colorado", change: 14 },
];

export const FORECAST = [
  { region: "Southwest", dir: "up", level: "Elevated", text: "Elevated anomaly conditions expected across NV, AZ, and NM over the next 14 days. Activity clustering near the Mojave corridor." },
  { region: "Mountain West", dir: "up", level: "Watch", text: "Front Range drone activity trending upward. Conditions favorable for continued reports through late June." },
  { region: "Pacific Northwest", dir: "flat", level: "Steady", text: "Activity holding near seasonal baseline. No significant pattern shift detected." },
  { region: "Midwest", dir: "down", level: "Quiet", text: "Midwestern activity trending downward. Report volume at its lowest point in 8 weeks." },
  { region: "Southeast", dir: "flat", level: "Steady", text: "Scattered coastal light reports continue at normal levels. Gulf activity unremarkable." },
];
