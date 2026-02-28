import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getHolidaysDK } from "@/lib/calendar/holidaysDK";
import { getWeeksInIsoYear } from "@/lib/calendar/iso";
import { getAscensionIsoWeek } from "@/lib/calendar/ascension";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  
  if (!yearParam || isNaN(parseInt(yearParam))) {
    return NextResponse.json({ error: "Valid year parameter is required" }, { status: 400 });
  }

  const year = parseInt(yearParam);

  try {
    const weeksInYear = getWeeksInIsoYear(year);
    const ascensionWeek = getAscensionIsoWeek(year);
    
    // Fetch generated/manual assignments
    const weekAssignmentsData = await prisma.weekAssignment.findMany({
      where: { year },
      include: { share: true },
      orderBy: { weekNumber: 'asc' }
    });

    // Format week assignments for frontend
    const weekAssignments = weekAssignmentsData.map(wa => ({
      weekNumber: wa.weekNumber,
      type: wa.type,
      share: wa.share ? { id: wa.share.id, code: wa.share.code, name: wa.share.name, color: wa.share.color } : null,
      note: wa.note,
      isLocked: wa.isLocked,
      source: wa.source
    }));

    // Fetch Events for the year
    // We do a simple bound based on ISO year limits
    const startObj = new Date(Date.UTC(year - 1, 11, 20)); // Buffer
    const endObj = new Date(Date.UTC(year + 1, 0, 10)); // Buffer
    
    const eventsData = await prisma.event.findMany({
      where: {
        startDate: { gte: startObj },
        endDate: { lte: endObj }
      },
      orderBy: { startDate: 'asc' }
    });

    const events = eventsData.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      allDay: e.allDay,
      description: e.description
    }));

    // Get Danish Holidays
    const holidays = getHolidaysDK(year);

    return NextResponse.json({
      year,
      weeksInYear,
      ascensionWeek,
      weekAssignments,
      events,
      holidays
    }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600"
      }
    });

  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
