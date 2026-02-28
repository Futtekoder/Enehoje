import { NextResponse } from "next/server";
import { getMarineStatus } from "@/lib/marine/getMarineStatus";

export async function GET(request: Request) {
    try {
        const data = await getMarineStatus();

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
            },
        });
    } catch (error) {
        console.error("Failed to fetch marine status via service:", error);

        // Degraded fallback matching the spec structure loosely
        return NextResponse.json({
            windStatus: "UNKNOWN",
            depthStatus: "UNKNOWN",
            sailingStatus: "UNKNOWN",
            error: "Conditions currently unavailable"
        }, { status: 503 });
    }
}
