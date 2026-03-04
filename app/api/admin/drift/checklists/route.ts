import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") return new NextResponse("Unauthorized", { status: 403 })

        const body = await request.json()
        const { sectionId, text, order } = body

        if (!sectionId || !text) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const item = await prisma.operationChecklistItem.create({
            data: {
                sectionId,
                text,
                order: order ?? 0
            }
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error("Error creating checklist item:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
