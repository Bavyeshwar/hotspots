# Fire Observation Dashboard

A React + Vite + Tailwind interface for exploring MODIS and VIIRS active-fire detections:
geographic activity, sensor comparison, historical charts, harmonization methods, and data
quality indicators.

## Run

```bash
npm install
npm run dev
```

## Important: the data is synthetic

Every number in the app is generated locally by `src/data/sample.js` (seeded, so it is
identical on every load). **None of it is NASA observations.** The UI says so persistently
(`DataNotice`). Do not cite or publish figures from this build.

## Connecting real data

All data access goes through `src/data/source.js` (`loadDataset()`). Return an object with
the shape documented there and the whole UI switches over; set `synthetic: false` and the
notice disappears.

Real MODIS and VIIRS active-fire detections are distributed by
[NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/). Its API needs a free MAP_KEY; check the
FIRMS API documentation for current endpoints, source names and rate limits. You will need to:

1. Fetch detections per region and date window (FIRMS limits the days per request).
2. Aggregate to monthly counts per sensor per region (`monthly`).
3. Map FIRMS confidence fields into `{ high, nominal, low }` shares. MODIS reports a numeric
   0 to 100% value; VIIRS 375 m reports low / nominal / high classes.
4. Compute a real `coverage` figure, or remove that indicator. The sample value is a stand-in.

## Structure

```
src/
  data/        regions, harmonization method metadata, synthetic generator, source seam
  lib/         analysis (metrics, harmonization), formatting, theme constants, PRNG
  context/     DashboardProvider: filters + derived data shared by every page
  components/
    ui/        Card, Button, Badge, Stat, Fields, DataTable, ConfidenceBar, ...
    charts/    LineChart, BarChart, ScatterChart (dependency-free SVG)
    map/       FireMap (graticule + points; no basemap bundled)
    layout/    AppShell, Sidebar, FilterBar, DataNotice
  pages/       Overview, Comparison, Historical, Methods, Quality
```

Design tokens (colors, type, radii, shadows) live in `tailwind.config.js`. Cyan always means
MODIS and ember always means VIIRS.

## Known limitations

- The map has no coastline layer, only a lat/lon graticule and region boxes. Add a GeoJSON
  basemap (for example Natural Earth) if you need geographic context.
- Region boxes are coarse rectangles, not administrative boundaries.
- Harmonization methods are simple in-sample statistical adjustments, not official NASA
  products. Their agreement metrics are optimistic because they are scored on the data they
  were fitted to.
- Charts are hand-rolled SVG for zero dependencies; swap in a charting library if you need
  zoom, brushing or export.
- This project was written without being built or run in a browser. Expect to fix small issues
  on first `npm run dev`.
