// GET /api/league?code=PL  -> standings + results + fixtures for one league.
// The football-data.org token lives in the FOOTBALL_DATA_TOKEN environment variable.
const API = "https://api.football-data.org/v4/competitions/";
const OK = ["PL", "PD", "SA", "BL1", "FL1", "CL"];

export default async (req) => {
  const code = new URL(req.url).searchParams.get("code") || "PL";
  if (!OK.includes(code)) return json({ error: "Unknown league" }, 400, false);
  const token = Netlify.env.get("FOOTBALL_DATA_TOKEN");
  if (!token) return json({ error: "Missing FOOTBALL_DATA_TOKEN" }, 500, false);
  const get = async (path) => {
    const r = await fetch(API + code + path, { headers: { "X-Auth-Token": token } });
    if (!r.ok) throw new Error("Data source returned " + r.status);
    return r.json();
  };
  try {
    const st = await get("/standings");
    const mt = await get("/matches");
    const rows = (st.standings.find((s) => s.type === "TOTAL") || st.standings[0]).table;
    const table = rows.map((r) => ({
      n: r.team.shortName || r.team.name, t: r.team.tla || String(r.team.id),
      p: r.playedGames, w: r.won, d: r.draw, l: r.lost, gf: r.goalsFor, ga: r.goalsAgainst, pts: r.points,
    }));
    const m = mt.matches.map((x) => ({
      d: x.utcDate, s: x.status, h: x.homeTeam.tla || String(x.homeTeam.id), a: x.awayTeam.tla || String(x.awayTeam.id),
      hg: x.score.fullTime.home, ag: x.score.fullTime.away,
    }));
    const finished = m.filter((x) => x.s === "FINISHED" && x.hg != null);
    const upcoming = m.filter((x) => x.s === "SCHEDULED" || x.s === "TIMED").sort((a, b) => (a.d < b.d ? -1 : 1)).slice(0, 12);
    return json({ code, name: st.competition.name, u: new Date().toISOString(), table, finished, upcoming }, 200, true);
  } catch (e) {
    return json({ error: String(e.message) }, 502, false);
  }
};

export const config = { path: "/api/league" };

function json(body, status, cache) {
  const headers = { "Content-Type": "application/json" };
  if (cache) {
    headers["Netlify-CDN-Cache-Control"] = "public, s-maxage=3600, stale-while-revalidate=86400";
    headers["Cache-Control"] = "public, max-age=300";
  } else headers["Cache-Control"] = "no-store";
  return new Response(JSON.stringify(body), { status, headers });
}
