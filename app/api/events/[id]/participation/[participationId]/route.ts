import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, participationId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const participationId = resolvedParams.participationId

        // Ensure the participation belongs to the user, or user is admin
        const participation = await prisma.eventParticipation.findUnique({
            where: { id: participationId }
        })

        if (!participation) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (participation.userId !== session.user.id && session.user.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.eventParticipation.delete({
            where: { id: participationId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting participation:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
