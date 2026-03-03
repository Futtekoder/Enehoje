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
        const { fromDate, toDate, mode, comment } = body

        if (!fromDate || !toDate || !mode) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const participation = await prisma.eventParticipation.create({
            data: {
                eventId,
                userId: session.user.id,
                mode,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                comment
            }
        })

        return NextResponse.json(participation)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return new NextResponse("Participation overlapping or already exists for this date range.", { status: 409 })
        }
        console.error("Error creating participation:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
