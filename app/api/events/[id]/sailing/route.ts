import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { canViewEvent } from "@/lib/planning/auth"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const eventId = resolvedParams.id

        const authorized = await canViewEvent(session.user.id, eventId)
        if (!authorized) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await request.json()
        const { direction, desiredAt, timeFlexibility, fromLocation, seats, notes } = body

        if (!direction || !desiredAt || !timeFlexibility || !fromLocation || seats === undefined) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const wish = await prisma.sailingWish.create({
            data: {
                eventId,
                userId: session.user.id,
                direction,
                desiredAt: new Date(desiredAt),
                timeFlexibility,
                fromLocation,
                seats,
                notes
            }
        })

        return NextResponse.json(wish)
    } catch (error) {
        console.error("Error creating sailing wish:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
