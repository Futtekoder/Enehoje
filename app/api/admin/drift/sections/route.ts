import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const body = await request.json()
        const { unitId, title, slug, description, order, isQuickAction } = body

        if (!unitId || !title || !slug) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const section = await prisma.operationSection.create({
            data: {
                unitId,
                title,
                slug,
                description,
                order: order ?? 0,
                isQuickAction: isQuickAction ?? false
            }
        })

        return NextResponse.json(section)
    } catch (error) {
        console.error("Error creating section:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
