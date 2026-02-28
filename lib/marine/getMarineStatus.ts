import { MarineStatus, MarineMeta } from "./types";
import { computeBestWindowToday } from "./bestWindow";
import { cacheGet, cacheSet } from "./cache";
import { fetchOpenMeteoWindAndForecast } from "./providers/openMeteo";
import { fetchWaterLevelWithFallback } from "./providers/waterLevel";

const DEFAULT_LAT = Number(process.env.MARINE_LAT ?? 54.838722);
const DEFAULT_LON = Number(process.env.MARINE_LON ?? 11.024556);

const BASE_DEPTH_M = Number(process.env.BASE_DEPTH ?? 1.35); // calibrated for Enehoje
const MIN_DEPTH_M = Number(process.env.MIN_REQUIRED_DEPTH ?? 1.0);
const MAX_WIND_MS = Number(process.env.MAX_ALLOWED_WIND ?? 13);

function windLevel(w: number | null): "SAFE" | "CAUTION" | "NO_GO" | "UNKNOWN" {
    if (w == null) return "UNKNOWN";
    if (w >= MAX_WIND_MS) return "NO_GO";
    if (w >= 11) return "CAUTION";
    return "SAFE";
}

function depthLevel(d: number | null): "SAFE" | "NO_GO" | "UNKNOWN" {
    if (d == null) return "UNKNOWN";
    return d >= MIN_DEPTH_M ? "SAFE" : "NO_GO";
}

function combine(a: string, b: string): "SAFE" | "CAUTION" | "NO_GO" | "UNKNOWN" {
    if (a === "UNKNOWN" || b === "UNKNOWN") return "UNKNOWN";
    if (a === "NO_GO" || b === "NO_GO") return "NO_GO";
    if (a === "CAUTION" || b === "CAUTION") return "CAUTION";
    return "SAFE";
}

export async function getMarineStatus(params?: { lat?: number; lon?: number; now?: Date }): Promise<MarineStatus> {
    const lat = params?.lat ?? DEFAULT_LAT;
    const lon = params?.lon ?? DEFAULT_LON;
    const now = params?.now ?? new Date();

    const cacheKey = `marine:${lat}:${lon}`;
    const cached = cacheGet<MarineStatus>(cacheKey);

    try {
        // 1) Fetch wind + forecast (Open-Meteo)
        const wind = await fetchOpenMeteoWindAndForecast({ lat, lon });

        // 2) Fetch water level / tide (DMI primary)
        const water = await fetchWaterLevelWithFallback({ lat, lon });

        // 3) Compute depth hourly
        const hourlyPoints = wind.hourly.map((h: any, idx: number) => {
            const wl = water.hourlyLevelM?.[idx] ?? water.currentLevelM ?? null;
            const depth = wl == null ? null : Number((BASE_DEPTH_M + wl).toFixed(2));

            return {
                time: new Date(h.time),
                windMs: h.windMs,
                depthM: depth,
            };
        });

        const bestWindowToday = computeBestWindowToday(hourlyPoints, now);

        const windNowMs = wind.current?.windMs ?? null;
        const depthNowM = (() => {
            const wl = water.currentLevelM;
            return wl == null ? null : Number((BASE_DEPTH_M + wl).toFixed(2));
        })();

        const windStatus = windLevel(windNowMs);
        const depthStatus = depthLevel(depthNowM);
        const sailingStatus = combine(windStatus, depthStatus);

        const meta: MarineMeta = {
            updatedAt: now.toISOString(),
            source: "LIVE",
            provider: { wind: "open-meteo", water: water.provider },
            notes: [],
        };

        const result: MarineStatus = {
            windNowMs,
            windDirectionDeg: wind.current?.windDirectionDeg ?? null,
            waterLevelM: water.currentLevelM ?? null,
            depthNowM,
            windStatus,
            depthStatus,
            sailingStatus,
            nextLowTide: water.nextLowTide ? {
                time: water.nextLowTide.time,
                levelM: water.nextLowTide.levelM,
                depthM: Number((BASE_DEPTH_M + water.nextLowTide.levelM).toFixed(2))
            } : null,
            bestWindowToday,
            forecast7d: wind.daily7d.map((d: any) => ({
                date: d.date,
                maxWindMs: d.maxWindMs,
                windStatus: windLevel(d.maxWindMs),
                weatherCode: d.weatherCode,
                maxTempC: d.maxTempC,
                minDepthM: BASE_DEPTH_M, // Fallback base depth
            })),
            meta,
        };

        cacheSet(cacheKey, result);
        return result;
    } catch (err: any) {
        // Fallback to cache if possible
        if (cached) {
            return {
                ...cached,
                meta: {
                    ...cached.meta,
                    source: "CACHE",
                    updatedAt: new Date().toISOString(),
                    notes: [...(cached.meta.notes ?? []), "Live fetch failed, using cached value"],
                },
            };
        }

        // Degraded response
        const meta: MarineMeta = {
            updatedAt: new Date().toISOString(),
            source: "DEGRADED",
            provider: { wind: "unknown", water: "none" },
            notes: ["No cached value available and live fetch failed"],
        };

        return {
            windNowMs: null,
            windDirectionDeg: null,
            waterLevelM: null,
            depthNowM: null,
            windStatus: "UNKNOWN",
            depthStatus: "UNKNOWN",
            sailingStatus: "UNKNOWN",
            nextLowTide: null,
            bestWindowToday: { status: "UNKNOWN", reason: "DEGRADED" },
            forecast7d: [],
            meta,
        };
    }
}
