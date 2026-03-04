import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        const body = await request.json()
        const { text, order } = body

        const item = await prisma.operationChecklistItem.update({
            where: { id: resolvedParams.itemId },
            data: { text, order }
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error("Error updating checklist item:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        await prisma.operationChecklistItem.delete({
            where: { id: resolvedParams.itemId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting checklist item:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
