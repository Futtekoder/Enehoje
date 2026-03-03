import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth()

        if (session?.user?.role !== "SYSTEM_ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const resolvedParams = await params;
        const targetUserId = resolvedParams.userId;

        const body = await request.json()
        const { role } = body

        if (!role || (role !== "ADMIN" && role !== "SYSTEM_ADMIN" && role !== "MEMBER")) {
            return new NextResponse("Invalid role", { status: 400 })
        }

        // Normalize role name
        const targetRole = role === "ADMIN" ? "SYSTEM_ADMIN" : "MEMBER"

        if (targetRole === "MEMBER") {
            // Last-admin guard
            const adminCount = await prisma.user.count({
                where: { role: "SYSTEM_ADMIN" }
            })

            // Check if the target user is currently an admin
            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { role: true }
            })

            if (targetUser?.role === "SYSTEM_ADMIN" && adminCount <= 1) {
                return new NextResponse("Cannot demote the last administrator.", { status: 409 })
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: targetRole }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating user role:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
