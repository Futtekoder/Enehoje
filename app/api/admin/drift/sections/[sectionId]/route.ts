import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sectionId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        const body = await request.json()
        const { title, slug, description, videoKey, videoSize, order, isQuickAction } = body

        const section = await prisma.operationSection.update({
            where: { id: resolvedParams.sectionId },
            data: { title, slug, description, videoKey, videoSize, order, isQuickAction }
        })

        return NextResponse.json(section)
    } catch (error) {
        console.error("Error updating section:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ sectionId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        await prisma.operationSection.delete({
            where: { id: resolvedParams.sectionId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting section:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
