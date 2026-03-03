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

        // Must be at least able to view the event to suggest a task
        const authorized = await canViewEvent(session.user.id, eventId)
        if (!authorized) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await request.json()
        const { title, description, category, criticality, attachmentFolderId } = body

        if (!title || !category || !criticality) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const task = await prisma.eventTask.create({
            data: {
                eventId,
                title,
                description,
                category,
                criticality,
                status: "PROPOSED", // All crowdsourced tasks start as PROPOSED
                createdByUserId: session.user.id,
                attachmentFolderId
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("Error creating task:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
