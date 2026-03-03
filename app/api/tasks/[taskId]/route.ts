import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { canApproveTasks } from "@/lib/planning/auth"

export async function PATCH(
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

        const body = await request.json()
        const { status, title, description, category, criticality, dueDate } = body

        // If trying to change status from PROPOSED to APPROVED/REJECTED/ACTIVE, require elevated logic
        if (status && status !== task.status) {
            const canApprove = await canApproveTasks(session.user.id, task.eventId)
            if (!canApprove && session.user.role !== "SYSTEM_ADMIN") {
                return new NextResponse("Forbidden: Only Administration or the Formand can approve tasks.", { status: 403 })
            }
        } else if (task.createdByUserId !== session.user.id && session.user.role !== "SYSTEM_ADMIN") {
            // General edit to title/description without changing status - must be creator or admin
            const canApprove = await canApproveTasks(session.user.id, task.eventId)
            if (!canApprove) {
                return new NextResponse("Forbidden: Cannot edit someone else's task.", { status: 403 })
            }
        }

        const updateData: any = {
            title, description, category, criticality
        }

        if (status) {
            updateData.status = status;
            if (status === "APPROVED" || status === "ACTIVE") {
                updateData.approvedByUserId = session.user.id
                updateData.approvedAt = new Date()
            }
        }

        if (dueDate !== undefined) {
            updateData.dueDate = dueDate ? new Date(dueDate) : null
        }

        const updatedTask = await prisma.eventTask.update({
            where: { id: taskId },
            data: updateData
        })

        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error("Error updating task:", error)
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

        const task = await prisma.eventTask.findUnique({
            where: { id: taskId }
        })

        if (!task) return new NextResponse("Not Found", { status: 404 })

        const canApprove = await canApproveTasks(session.user.id, task.eventId)
        if (task.createdByUserId !== session.user.id && !canApprove && session.user.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.eventTask.delete({
            where: { id: taskId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting task:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
