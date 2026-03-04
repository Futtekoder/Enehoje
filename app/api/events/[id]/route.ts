import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { canViewEvent } from "@/lib/planning/auth"

export async function GET(
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

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                participations: {
                    include: {
                        user: { select: { id: true, name: true, image: true, role: true } }
                    }
                },
                tasks: {
                    include: {
                        createdByUser: { select: { name: true } },
                        signups: { include: { user: { select: { name: true, image: true } } } },
                        votes: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                sailingWishes: {
                    include: {
                        user: { select: { name: true, image: true } }
                    },
                    orderBy: { desiredAt: 'asc' }
                }
            }
        })

        if (!event) {
            return new NextResponse("Not Found", { status: 404 })
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error("Error fetching event:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const eventId = resolvedParams.id

        // Fetch event to check ownership
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { createdByUserId: true }
        })

        if (!event) return new NextResponse("Not Found", { status: 404 })

        // Only creator (or SYSTEM_ADMIN) can delete
        if (event.createdByUserId !== session.user.id && session.user.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Delete event
        await prisma.event.delete({
            where: { id: eventId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting event:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
