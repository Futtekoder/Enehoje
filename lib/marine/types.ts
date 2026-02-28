export type MarineStatusLevel = "SAFE" | "CAUTION" | "NO_GO" | "UNKNOWN";
export type DataSourceMode = "LIVE" | "CACHE" | "DEGRADED";

export interface MarineMeta {
    updatedAt: string; // ISO
    source: DataSourceMode;
    provider: {
        wind: "open-meteo" | "unknown";
        water: "dmi" | "kyst" | "unknown" | "none";
    };
    notes?: string[];
}

export interface BestWindowToday {
    status: "SAFE" | "CAUTION" | "NONE" | "UNKNOWN";
    start?: string; // ISO
    end?: string;   // ISO
    durationMinutes?: number;

    windMinMs?: number;
    windMaxMs?: number;

    depthMinM?: number;
    depthMaxM?: number;

    reason?: string; // e.g. "NO_SAFE_SEGMENTS", "DATA_MISSING"
}

export interface ForecastDay {
    date: string; // YYYY-MM-DD
    maxWindMs: number;
    windStatus: "SAFE" | "CAUTION" | "NO_GO";
    weatherCode?: number; // Open-Meteo general weather
    maxTempC?: number;    // Open-Meteo max daily temperature
    minDepthM?: number;   // optional if we can compute
    depthStatus?: "SAFE" | "NO_GO";
}

export interface MarineStatus {
    // Current conditions
    windNowMs: number | null;
    windDirectionDeg: number | null;

    waterLevelM: number | null;   // relative to source datum
    depthNowM: number | null;

    windStatus: MarineStatusLevel;
    depthStatus: MarineStatusLevel;
    sailingStatus: MarineStatusLevel; // combined

    nextLowTide?: {
        time: string; // ISO
        levelM: number; // water level at low tide
        depthM?: number; // if we compute
    } | null;

    bestWindowToday: BestWindowToday;

    forecast7d: ForecastDay[];

    meta: MarineMeta;
}
