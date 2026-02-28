// Calculate Ascension Day (Kristi Himmelfart).
// It is always exactly 39 days after Easter Sunday.

export function getEasterSunday(year: number): Date {
    // Computus (Meeus/Jones/Butcher algorithm)
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
}

export function getAscensionDate(year: number): Date {
    const easter = getEasterSunday(year);
    const ascension = new Date(easter.getTime());
    ascension.setUTCDate(ascension.getUTCDate() + 39);
    return ascension;
}

import { getIsoWeek } from "./iso";

export function getAscensionIsoWeek(year: number): number {
    const ascensionDate = getAscensionDate(year);
    return getIsoWeek(ascensionDate);
}
