import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { year, weekNumber, type, shareId, note } = body;

        if (!year || !weekNumber || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Find existing week assignment to check lock status
        const existing = await prisma.weekAssignment.findUnique({
            where: {
                year_weekNumber: { year, weekNumber }
            }
        });

        if (existing && existing.isLocked) {
            return NextResponse.json({ error: "This week is locked (Ascension Week) and cannot be manually modified." }, { status: 403 });
        }

        // 2. Build update payload (forcing Source to MANUAL)
        const updatePayload: any = {
            type,
            note,
            source: "MANUAL"
        };

        if (type === "SHARE") {
            if (!shareId) return NextResponse.json({ error: "shareId is required when type is SHARE" }, { status: 400 });
            updatePayload.shareId = shareId;
        } else {
            updatePayload.shareId = null; // Clear out share if changed to COMMON/BLOCKED etc.
        }

        // 3. Apply Update or Create
        const result = await prisma.weekAssignment.upsert({
            where: {
                year_weekNumber: { year, weekNumber }
            },
            update: updatePayload,
            create: {
                year,
                weekNumber,
                ...updatePayload,
                isLocked: false
            }
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Failed to patch week assignment:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
