import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ unitId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        const body = await request.json()
        const { title, slug, description, icon, order } = body

        const unit = await prisma.operationUnit.update({
            where: { id: resolvedParams.unitId },
            data: { title, slug, description, icon, order }
        })

        return NextResponse.json(unit)
    } catch (error) {
        console.error("Error updating unit:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ unitId: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const resolvedParams = await params
        await prisma.operationUnit.delete({
            where: { id: resolvedParams.unitId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting unit:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
