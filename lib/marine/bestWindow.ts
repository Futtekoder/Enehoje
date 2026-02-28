import { BestWindowToday } from "./types";

export interface HourPoint {
    time: Date;
    windMs: number | null;
    depthM: number | null;
}

const WIND_NO_GO = Number(process.env.MAX_ALLOWED_WIND_MS ?? 13);
const WIND_CAUTION = 11;
const MIN_DEPTH = Number(process.env.MIN_REQUIRED_DEPTH_M ?? 1.0);

const MIN_WINDOW_MINUTES = 60;
const MIN_WINDOW_MINUTES_CAUTION = 20;

function minutesBetween(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / 60000);
}

function clampToToday(points: HourPoint[], now: Date) {
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const start = new Date(y, m, d, 0, 0, 0);
    const end = new Date(y, m, d, 23, 59, 59);
    return { start, end };
}

export function computeBestWindowToday(points: HourPoint[], now: Date): BestWindowToday {
    if (!points?.length) {
        return { status: "UNKNOWN", reason: "NO_POINTS" };
    }

    const { start: dayStart, end: dayEnd } = clampToToday(points, now);

    // Filter to today and from now -> end of day
    const todayPoints = points.filter(p => p.time >= now && p.time <= dayEnd);

    if (todayPoints.length === 0) {
        return { status: "NONE", reason: "NO_POINTS_TODAY" };
    }

    // isSafe per point
    const safe = todayPoints.map(p => {
        if (p.windMs == null || p.depthM == null) return false;
        return p.windMs < WIND_NO_GO && p.depthM >= MIN_DEPTH;
    });

    // Extract safe segments
    type Seg = { startIdx: number; endIdx: number };
    const segments: Seg[] = [];
    let i = 0;

    while (i < safe.length) {
        if (!safe[i]) { i++; continue; }
        const startIdx = i;
        while (i < safe.length && safe[i]) i++;
        const endIdx = i - 1;
        segments.push({ startIdx, endIdx });
    }

    if (segments.length === 0) {
        return { status: "NONE", reason: "NO_SAFE_SEGMENTS" };
    }

    // Score segments
    const scored = segments.map(seg => {
        const slice = todayPoints.slice(seg.startIdx, seg.endIdx + 1);

        const winds = slice.map(p => p.windMs!).filter(n => Number.isFinite(n));
        const depths = slice.map(p => p.depthM!).filter(n => Number.isFinite(n));

        const startTime = slice[0].time;
        // We interpret the end as the end of the last hour slot.
        const endTime = new Date(slice[slice.length - 1].time.getTime() + 60 * 60 * 1000);

        const duration = minutesBetween(startTime, endTime);

        const windMin = Math.min(...winds);
        const windMax = Math.max(...winds);
        const depthMin = Math.min(...depths);
        const depthMax = Math.max(...depths);

        const caution = windMax >= WIND_CAUTION;

        // Primary score: duration (bigger better)
        // Secondary: max wind (smaller better)
        // Tertiary: min depth (bigger better)
        const score = duration * 100000 - windMax * 100 + depthMin;

        return {
            seg,
            startTime,
            endTime,
            duration,
            windMin,
            windMax,
            depthMin,
            depthMax,
            caution,
            score
        };
    });

    // Filter out ultra-short segments (ignore < 20 min)
    const usable = scored.filter(s => s.duration >= MIN_WINDOW_MINUTES_CAUTION);
    if (usable.length === 0) {
        return { status: "NONE", reason: "ONLY_TINY_WINDOWS" };
    }

    usable.sort((a, b) => b.score - a.score);
    const best = usable[0];

    let status: BestWindowToday["status"] = "SAFE";

    if (best.duration < MIN_WINDOW_MINUTES) status = "CAUTION"; // short window
    if (best.caution) status = "CAUTION";

    return {
        status,
        start: best.startTime.toISOString(),
        end: best.endTime.toISOString(),
        durationMinutes: best.duration,
        windMinMs: Number(best.windMin.toFixed(1)),
        windMaxMs: Number(best.windMax.toFixed(1)),
        depthMinM: Number(best.depthMin.toFixed(2)),
        depthMaxM: Number(best.depthMax.toFixed(2)),
    };
}
