import { getEasterSunday, getAscensionDate } from "./ascension";

export type Holiday = { date: string; name: string };

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}

export function getHolidaysDK(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // Fixed Holidays
    holidays.push({ date: `${year}-01-01`, name: "Nytårsdag" });
    holidays.push({ date: `${year}-12-25`, name: "Juledag" });
    holidays.push({ date: `${year}-12-26`, name: "2. Juledag" });

    // Moving Holidays (Based on Easter)
    const easter = getEasterSunday(year);

    holidays.push({ date: formatDate(addDays(easter, -3)), name: "Skærtorsdag" });
    holidays.push({ date: formatDate(addDays(easter, -2)), name: "Langfredag" });
    holidays.push({ date: formatDate(easter), name: "Påskedag" });
    holidays.push({ date: formatDate(addDays(easter, 1)), name: "2. Påskedag" });

    // Store Bededag was abolished in 2024. If we ever need to support historic years:
    if (year < 2024) {
        holidays.push({ date: formatDate(addDays(easter, 26)), name: "Store Bededag" });
    }

    const ascension = getAscensionDate(year);
    holidays.push({ date: formatDate(ascension), name: "Kristi Himmelfartsdag" });

    holidays.push({ date: formatDate(addDays(easter, 49)), name: "Pinsedag" });
    holidays.push({ date: formatDate(addDays(easter, 50)), name: "2. Pinsedag" });

    // Semi-holidays often celebrated in DK (Optional, currently sticking to strict red days)
    // Grundlovsdag is a half or full day off for many, but not an official 'red day' for all. We'll include it.
    holidays.push({ date: `${year}-06-05`, name: "Grundlovsdag" });

    return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
