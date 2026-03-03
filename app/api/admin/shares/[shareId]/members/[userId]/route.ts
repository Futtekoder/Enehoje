import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ shareId: string }> }
) {
    try {
        const session = await auth()

        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const resolvedParams = await params;
        const shareId = resolvedParams.shareId;

        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return new NextResponse("Missing userId", { status: 400 })
        }

        const newMembership = await prisma.shareMembership.create({
            data: {
                userId,
                shareId,
                isChair: false
            }
        })

        return NextResponse.json(newMembership)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return new NextResponse("User is already a member", { status: 409 })
        }
        console.error("Error adding membership:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ shareId: string, userId: string }> }
) {
    try {
        const session = await auth()

        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const resolvedParams = await params;
        const shareId = resolvedParams.shareId;
        const targetUserId = resolvedParams.userId;

        // Cannot remove chair
        const membership = await prisma.shareMembership.findUnique({
            where: {
                userId_shareId: {
                    userId: targetUserId,
                    shareId: shareId
                }
            }
        })

        if (membership?.isChair) {
            return new NextResponse("Cannot remove the Formand. Appoint a new Formand first.", { status: 400 })
        }

        await prisma.shareMembership.delete({
            where: {
                userId_shareId: {
                    userId: targetUserId,
                    shareId: shareId
                }
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error removing membership:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
