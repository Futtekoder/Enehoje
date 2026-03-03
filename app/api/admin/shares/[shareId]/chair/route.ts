import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ shareId: string }> }
) {
    try {
        const session = await auth()

        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params;
        const shareId = resolvedParams.shareId;

        const { userId } = await request.json()

        if (!userId) {
            return new NextResponse("Missing userId", { status: 400 })
        }

        // Validate membership exists
        const membership = await prisma.shareMembership.findUnique({
            where: {
                userId_shareId: {
                    userId: userId,
                    shareId: shareId
                }
            }
        })

        if (!membership) {
            return new NextResponse("User is not a member of this share", { status: 400 })
        }

        // Transaction to enforce the rule: Only one chair per share
        const [_, updatedMembership] = await prisma.$transaction([
            // 1. Unset any existing chairs for this share
            prisma.shareMembership.updateMany({
                where: {
                    shareId: shareId,
                    isChair: true
                },
                data: { isChair: false }
            }),
            // 2. Set the new chair
            prisma.shareMembership.update({
                where: {
                    userId_shareId: {
                        userId: userId,
                        shareId: shareId
                    }
                },
                data: { isChair: true }
            })
        ])

        return NextResponse.json(updatedMembership)
    } catch (error) {
        console.error("Error setting chair:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
