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
        const { roleLabel } = body

        const signup = await prisma.taskSignup.create({
            data: {
                taskId,
                userId: session.user.id,
                roleLabel
            }
        })

        return NextResponse.json(signup)
    } catch (error: any) {
        if (error.code === 'P2002') return new NextResponse("Already signed up", { status: 409 })
        console.error("Error signing up for task:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const taskId = resolvedParams.taskId

        await prisma.taskSignup.delete({
            where: {
                taskId_userId: {
                    taskId,
                    userId: session.user.id
                }
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error leaving task:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
