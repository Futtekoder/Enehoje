import { prisma } from "@/lib/db"

const BASE_YEAR = 2025
const TOTAL_SHARES = 5

export async function getYearWeeks(year: number) {
    // 1. Fetch all components in parallel (2 DB calls total)
    const [allWeeks, allShares] = await Promise.all([
        prisma.week.findMany({
            where: { year },
            include: {
                share: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    }
                }
            }
        }),
        prisma.share.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                color: true,
            }
        })
    ])

    if (allShares.length === 0) return []

    // 2. Calculate Calendar In-Memory
    const weeks = []

    // Pre-calculate items for logic
    const yearDiff = year - BASE_YEAR
    const offset = ((yearDiff % TOTAL_SHARES) + TOTAL_SHARES) % TOTAL_SHARES

    for (let i = 1; i <= 52; i++) {
        // Check for Override/Swap in fetched data
        const override = allWeeks.find(w => w.weekNumber === i)

        if (override) {
            weeks.push({
                weekNumber: i,
                owner: override.share,
                source: override.source
            })
            continue
        }

        // Calculate Rotation
        const ownerIndex = (i - 1 + offset) % allShares.length
        weeks.push({
            weekNumber: i,
            owner: allShares[ownerIndex],
            source: 'ROTATION'
        })
    }

    return weeks
}

// Keep single helper if needed elsewhere, but optimize it too
export async function getWeekOwner(year: number, week: number) {
    const weekRecord = await prisma.week.findUnique({
        where: { year_weekNumber: { year, weekNumber: week } },
        include: { share: { select: { id: true, name: true, color: true } } }
    })

    if (weekRecord) return { share: weekRecord.share, source: weekRecord.source }

    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, color: true }
    })

    if (shares.length === 0) return null

    const yearDiff = year - BASE_YEAR
    const offset = ((yearDiff % TOTAL_SHARES) + TOTAL_SHARES) % TOTAL_SHARES
    const ownerIndex = (week - 1 + offset) % shares.length

    return { share: shares[ownerIndex], source: 'ROTATION' }
}
