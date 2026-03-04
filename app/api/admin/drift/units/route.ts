import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const units = await prisma.operationUnit.findMany({
            orderBy: { order: 'asc' },
            include: {
                sections: {
                    orderBy: { order: 'asc' },
                    include: {
                        checklist: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        })
        return NextResponse.json(units)
    } catch (error) {
        console.error("Error fetching units:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await request.json()
        const { title, slug, description, icon, order } = body

        if (!title || !slug) {
            return new NextResponse("Title and slug are required", { status: 400 })
        }

        const unit = await prisma.operationUnit.create({
            data: {
                title,
                slug,
                description,
                icon,
                order: order ?? 0
            }
        })

        return NextResponse.json(unit)
    } catch (error) {
        console.error("Error creating unit:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
