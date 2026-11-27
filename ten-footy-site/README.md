# TEN Footy

Static site (index.html) + one Netlify Function (netlify/functions/league.mjs).
Needs one environment variable in Netlify: FOOTBALL_DATA_TOKEN (your football-data.org token).

## Deploy
1. GitHub: create a new repository (e.g. ten-footy). Add file > Upload files, and drag in
   index.html, netlify.toml, README.md and the whole netlify folder (keep netlify/functions/league.mjs).
2. Netlify: Add new site > Import an existing project > GitHub > pick the repository.
   Leave the build command empty; publish directory is ".".
3. Netlify: Site configuration > Environment variables > add FOOTBALL_DATA_TOKEN
   (make sure it applies to Functions), then trigger a new deploy.
4. Open your-site.netlify.app. Test the function at /api/league?code=PL
