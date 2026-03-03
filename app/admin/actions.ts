
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    })

    if (!user || user.role !== 'SYSTEM_ADMIN') {
        throw new Error("Forbidden")
    }
}

export async function toggleAdminRole(userId: string, currentRole: string) {
    await checkAdmin()

    const newRole = currentRole === 'SYSTEM_ADMIN' ? 'MEMBER' : 'SYSTEM_ADMIN'

    // Last admin guard
    if (newRole === 'MEMBER') {
        const adminCount = await prisma.user.count({
            where: { role: 'SYSTEM_ADMIN' }
        })
        if (adminCount <= 1) {
            throw new Error("Der skal mindst være én administrator tilbage.")
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    })

    revalidatePath("/admin")
}

export async function deleteUser(userId: string) {
    await checkAdmin()

    await prisma.user.delete({
        where: { id: userId }
    })

    revalidatePath("/admin")
}

export async function updateUserStatus(userId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    await checkAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { status }
    })

    revalidatePath("/admin")
}
