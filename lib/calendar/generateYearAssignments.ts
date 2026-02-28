import { PrismaClient } from '@prisma/client'
import { getWeeksInIsoYear } from './iso'
import { getAscensionIsoWeek } from './ascension'

// Assumes singleton or passed instance, but creating new for the utility script
const prisma = new PrismaClient()

export async function generateYearAssignments(year: number, overrideAnchorIndex?: number) {
    // 1. Get settings and base sequence
    const settings = await prisma.calendarSettings.findFirst()
    const anchorIndex = overrideAnchorIndex ?? (settings?.anchorShareIndex || 0)

    const sequenceItems = await prisma.shareSequenceItem.findMany({
        orderBy: { position: 'asc' },
        include: { share: true }
    })

    if (sequenceItems.length === 0) {
        throw new Error("No ShareSequence defined in the database. Please setup the sequence first.")
    }

    // 2. Fetch existing assignments for this year to preserve MANUAL overrides
    const existingAssignments = await prisma.weekAssignment.findMany({
        where: { year }
    })
    const existingMap = new Map(existingAssignments.map(a => [a.weekNumber, a]))

    // 3. Calculate year constraints
    const weeks = getWeeksInIsoYear(year)
    const ascensionWeek = getAscensionIsoWeek(year)

    const newRecords = []
    let sequencePointer = anchorIndex

    for (let week = 1; week <= weeks; week++) {
        const existing = existingMap.get(week)

        // Rule A: If MANUAL override exists, ALWAYS respect it, do not touch.
        if (existing && existing.source === 'MANUAL') {
            continue
        }

        // Rule B: Ascension Week is ALWAYS locked to COMMON.
        if (week === ascensionWeek) {
            newRecords.push({
                year,
                weekNumber: week,
                type: 'COMMON' as const,
                isLocked: true,
                source: 'GENERATED' as const,
                note: 'Kristi Himmelfart (Automatisk)'
            })
            continue
        }

        // Rule C: Standard Sequence Assignment
        const currentItem = sequenceItems[sequencePointer % sequenceItems.length]
        newRecords.push({
            year,
            weekNumber: week,
            type: 'SHARE' as const,
            shareId: currentItem.share.id, // Using the UUID id reference
            isLocked: false,
            source: 'GENERATED' as const
        })

        // Advance the pointer ONLY when a share week was successfully assigned
        sequencePointer++
    }

    // 4. Batch Upsert
    // Prisma doesn't have a true bulk upsert for complex models easily, so we run a transaction
    await prisma.$transaction(
        newRecords.map(record =>
            prisma.weekAssignment.upsert({
                where: {
                    year_weekNumber: {
                        year: record.year,
                        weekNumber: record.weekNumber
                    }
                },
                update: record,
                create: record
            })
        )
    )

    return {
        year,
        generatedWeeks: newRecords.length,
        ascensionWeekId: ascensionWeek
    }
}
