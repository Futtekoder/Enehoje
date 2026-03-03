import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { canViewEvent } from "@/lib/planning/auth"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const taskId = resolvedParams.taskId

        const task = await prisma.eventTask.findUnique({
            where: { id: taskId }
        })

        if (!task) return new NextResponse("Not Found", { status: 404 })

        const authorized = await canViewEvent(session.user.id, task.eventId)
        if (!authorized) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await request.json()
        const { vote } = body // 1 for UP, -1 for DOWN

        if (vote !== 1 && vote !== -1) {
            return new NextResponse("Invalid vote value", { status: 400 })
        }

        // Upsert the vote so users can seamlessly change their vote or re-vote
        const upsertedVote = await prisma.taskVote.upsert({
            where: {
                taskId_userId: {
                    taskId,
                    userId: session.user.id
                }
            },
            update: {
                vote
            },
            create: {
                taskId,
                userId: session.user.id,
                vote
            }
        })

        return NextResponse.json(upsertedVote)
    } catch (error) {
        console.error("Error voting on task:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
