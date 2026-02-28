import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateYearAssignments } from "@/lib/calendar/generateYearAssignments";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // In a real app, verify admin session here.
  
  try {
    const body = await request.json();
    const { year, anchorIndex } = body;

    if (!year || isNaN(year)) {
      return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }

    const result = await generateYearAssignments(parseInt(year), anchorIndex ? parseInt(anchorIndex) : undefined);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.generatedWeeks} weeks for ${result.year}`,
      data: result
    });

  } catch (error: any) {
    console.error("Failed to generate year assignments:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
