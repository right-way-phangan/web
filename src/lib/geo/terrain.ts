/**
 * Elevation + slope at a point, from the free Open-Meteo elevation API
 * (SRTM ~30m, no API key). One batched request fetches the centre plus eight
 * neighbours ~60m out; slope = max neighbour drop / distance, in PERCENT —
 * the unit Thai regulations use (35% / 50% thresholds).
 *
 * Indicative, and it reads HIGH on Phangan: SRTM returns the top of the forest
 * canopy, so both the elevation and the derived gradient come out above a real
 * survey (a plot surveyed at 32–48 m a.s.l. / 27% samples as ~65 m / ~51%).
 * Treat it as "is this flat or steep", not as a number to build with — the UI
 * lets the user type survey figures over it. Returns null on network failure.
 */

export interface TerrainSample {
  /** Elevation above sea level at the point, metres. */
  elevationM: number;
  /** Estimated ground slope, PERCENT (steepest neighbour gradient). */
  slopePct: number;
}

const NEIGHBOR_M = 60;

export async function fetchTerrain(lat: number, lng: number): Promise<TerrainSample | null> {
  const rad = Math.PI / 180;
  const dLat = NEIGHBOR_M / 110540;
  const dLng = NEIGHBOR_M / (111320 * Math.cos(lat * rad));
  // Centre first, then 8 neighbours (N, S, E, W, NE, NW, SE, SW).
  const pts: Array<[number, number]> = [
    [lat, lng],
    [lat + dLat, lng],
    [lat - dLat, lng],
    [lat, lng + dLng],
    [lat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat + dLat, lng - dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng],
  ];
  const lats = pts.map((p) => p[0].toFixed(5)).join(",");
  const lngs = pts.map((p) => p[1].toFixed(5)).join(",");
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { elevation?: number[] };
    const e = data.elevation;
    if (!Array.isArray(e) || e.length < 9 || typeof e[0] !== "number") return null;

    const centre = e[0];
    // Diagonal neighbours sit √2·60m away; straight ones at 60m.
    const dist = (i: number) => (i >= 5 ? NEIGHBOR_M * Math.SQRT2 : NEIGHBOR_M);
    let maxGrade = 0;
    for (let i = 1; i < 9; i++) {
      const drop = Math.abs(e[i] - centre);
      maxGrade = Math.max(maxGrade, drop / dist(i));
    }
    return { elevationM: Math.round(centre), slopePct: Math.round(maxGrade * 100) };
  } catch {
    return null;
  }
}
