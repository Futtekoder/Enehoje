import { prisma } from "@/lib/db"

const BASE_YEAR = 2025
const TOTAL_SHARES = 5

export async function getWeekOwner(year: number, week: number) {
    // 1. Check for DB overrides/swaps first
    const weekRecord = await prisma.week.findUnique({
        where: {
            year_weekNumber: {
                year,
                weekNumber: week,
            },
        },
        include: {
            share: true,
        },
    })

    if (weekRecord) {
        return {
            share: weekRecord.share,
            source: weekRecord.source,
        }
    }

    // 2. Calculate Baseline/Rotation
    // Sort shares deterministically (e.g., by name or creation date)
    // Since we seeded them, we can fetch them.
    // Ideally, we cache this or hardcode IDs if they are static, but fetching is safer.
    const shares = await prisma.share.findMany({
        orderBy: {
            name: 'asc', // Assumes 'Andel 1', 'Andel 2'...
        },
    })

    if (shares.length === 0) return null

    // Calculate Offset
    // 2025: Offset 0
    // 2026: Offset 1
    // ...
    const yearDiff = year - BASE_YEAR
    const offset = ((yearDiff % TOTAL_SHARES) + TOTAL_SHARES) % TOTAL_SHARES

    // Round-robin assignment
    // Week 1 -> (0 + offset) % 5
    // Week 2 -> (1 + offset) % 5
    // ...
    // But wait, the spec implies they have "weeks", usually scattered. 
    // A common pattern is: Share 1 gets 1, 6, 11... 
    // Let's assume a simple modulo distribution for MVP:
    // ownerIndex = (weekNumber - 1 + offset) % 5
    // If offset is 1 (next year), everyone shifts "forward" in the calendar? 
    // "Rotation" usually means: If I had Week 1 last year, I have Week 2 this year? Or Week 53?
    // Spec says: "Årlig forskydning via offset".
    // Let's stick to: OwnerIndex = ((week - 1) - offset + TOTAL_SHARES) % TOTAL_SHARES
    // Example: 
    // Year 0 (Offset 0): Week 1 -> Index 0 (Andel 1).
    // Year 1 (Offset 1): Week 1 -> Index 4 (Andel 5)? Or Index 1 (Andel 2)?
    // Usually rotation means "I move to the next slot".
    // Let's implement: ownerIndex = (week - 1 + offset) % 5. 

    // NOTE: Simple modulo logic for the "Standard Distribution".
    const ownerIndex = (week - 1 + offset) % shares.length

    return {
        share: shares[ownerIndex],
        source: 'ROTATION',
    }
}

export async function getYearWeeks(year: number) {
    const weeks = []
    for (let i = 1; i <= 52; i++) {
        const ownerData = await getWeekOwner(year, i)
        weeks.push({
            weekNumber: i,
            owner: ownerData?.share,
            source: ownerData?.source,
        })
    }
    return weeks
}
