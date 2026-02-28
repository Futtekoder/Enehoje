import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getHolidaysDK } from "@/lib/calendar/holidaysDK";
import { getStartOfIsoWeek } from "@/lib/calendar/iso";

const prisma = new PrismaClient();

// ICS specification formatting helper
const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// All day dates in ICS are just YYYYMMDD
const formatIcsAllDay = (date: Date): string => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const fallbackYear = new Date().getFullYear();
    const year = yearParam ? parseInt(yearParam) : fallbackYear;

    try {
        const settings = await prisma.calendarSettings.findFirst() || { includeHolidaysInIcs: true, includeWeekAssignmentsInIcs: true };

        let icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Enehoje//Kalender//DA",
            "X-WR-CALNAME:Enehøje",
            "X-APPLE-CALENDAR-COLOR:#0055AA"
        ];

        // 1. Week Assignments as All-Day Events
        if (settings.includeWeekAssignmentsInIcs) {
            const assignments = await prisma.weekAssignment.findMany({
                where: { year },
                include: { share: true }
            });

            for (const assignment of assignments) {
                let summary = `Uge ${assignment.weekNumber} - `;
                if (assignment.type === 'SHARE' && assignment.share) {
                    summary += `Andel ${assignment.share.code || assignment.share.name}`;
                } else if (assignment.type === 'COMMON') {
                    summary += `FÆLLES`;
                } else {
                    summary += assignment.type;
                }

                const startDate = getStartOfIsoWeek(year, assignment.weekNumber);

                // End date for "all day" events in ICS is exclusive, 
                // so a 1-week event starting Monday ends the *following* Monday
                const endDate = new Date(startDate.getTime());
                endDate.setUTCDate(endDate.getUTCDate() + 7);

                icsContent.push(
                    "BEGIN:VEVENT",
                    `UID:week-${year}-${assignment.weekNumber}@enehoje.dk`,
                    `DTSTAMP:${formatIcsDate(new Date())}`,
                    `DTSTART;VALUE=DATE:${formatIcsAllDay(startDate)}`,
                    `DTEND;VALUE=DATE:${formatIcsAllDay(endDate)}`,
                    `SUMMARY:${summary}`,
                    assignment.note ? `DESCRIPTION:${assignment.note}` : "",
                    "END:VEVENT"
                );
            }
        }

        // 2. Actual Events (Work weekends, assemblies, etc)
        const yearStartObj = new Date(Date.UTC(year, 0, 1));
        const yearEndObj = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

        const events = await prisma.event.findMany({
            where: {
                startDate: { gte: yearStartObj },
                endDate: { lte: yearEndObj }
            }
        });

        for (const event of events) {
            icsContent.push("BEGIN:VEVENT");
            icsContent.push(`UID:event-${event.id}@enehoje.dk`);
            icsContent.push(`DTSTAMP:${formatIcsDate(event.createdAt)}`);

            if (event.allDay) {
                const nextDay = new Date(event.endDate.getTime());
                nextDay.setUTCDate(nextDay.getUTCDate() + 1); // ICS exclusive end

                icsContent.push(`DTSTART;VALUE=DATE:${formatIcsAllDay(event.startDate)}`);
                icsContent.push(`DTEND;VALUE=DATE:${formatIcsAllDay(nextDay)}`);
            } else {
                icsContent.push(`DTSTART:${formatIcsDate(event.startDate)}`);
                icsContent.push(`DTEND:${formatIcsDate(event.endDate)}`);
            }

            icsContent.push(`SUMMARY:${event.title}`);
            if (event.description) icsContent.push(`DESCRIPTION:${event.description}`);
            icsContent.push("END:VEVENT");
        }

        // 3. Holidays (Optional)
        if (settings.includeHolidaysInIcs) {
            const holidays = getHolidaysDK(year);
            for (const [index, holiday] of holidays.entries()) {
                const hDate = new Date(holiday.date);
                const nextDay = new Date(hDate.getTime());
                nextDay.setUTCDate(nextDay.getUTCDate() + 1);

                icsContent.push(
                    "BEGIN:VEVENT",
                    `UID:holiday-${year}-${index}@enehoje.dk`,
                    `DTSTAMP:${formatIcsDate(new Date())}`,
                    `DTSTART;VALUE=DATE:${formatIcsAllDay(hDate)}`,
                    `DTEND;VALUE=DATE:${formatIcsAllDay(nextDay)}`,
                    `SUMMARY:${holiday.name} (Helligdag)`,
                    "END:VEVENT"
                );
            }
        }

        icsContent.push("END:VCALENDAR");

        return new Response(icsContent.filter(Boolean).join("\r\n"), {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="enehoje-kalender-${year}.ics"`,
                "Cache-Control": "public, max-age=3600"
            },
        });

    } catch (error) {
        console.error("Failed to generate ICS feed:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
