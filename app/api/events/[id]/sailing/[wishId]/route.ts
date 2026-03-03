import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, wishId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const resolvedParams = await params
        const wishId = resolvedParams.wishId

        const wish = await prisma.sailingWish.findUnique({
            where: { id: wishId }
        })

        if (!wish) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (wish.userId !== session.user.id && session.user.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.sailingWish.delete({
            where: { id: wishId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting sailing wish:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
