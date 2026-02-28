import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, description, startDate, endDate, allDay } = body;

    if (!title || !type || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);

    const event = await prisma.event.create({
      data: {
        title,
        type,
        description,
        startDate: startObj,
        endDate: endObj,
        allDay: allDay ?? true
      }
    });

    return NextResponse.json({ success: true, data: event });

  } catch (error: any) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

    try {
        await prisma.event.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
