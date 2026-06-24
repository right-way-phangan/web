/**
 * Elevation + slope at a point, from the free Open-Meteo elevation API
 * (SRTM ~30m, no API key). One batched request fetches the centre plus eight
 * neighbours ~60m out; slope = atan(max neighbour drop / 60m) in DEGREES.
 * Indicative — not a substitute for a survey. Returns null on network failure.
 */

export interface TerrainSample {
  /** Elevation above sea level at the point, metres. */
  elevationM: number;
  /** Estimated ground slope, degrees (steepest neighbour gradient). */
  slopeDeg: number;
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
    const slopeDeg = Math.atan(maxGrade) / rad;
    return { elevationM: Math.round(centre), slopeDeg: Math.round(slopeDeg) };
  } catch {
    return null;
  }
}
