
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

export async function updateUserShare(userId: string, shareId: string) {
    await checkAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { shareId: shareId || null }
    })

    revalidatePath("/admin")
}
