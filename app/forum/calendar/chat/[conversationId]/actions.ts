"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function sendChatMessage(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    if (!user) throw new Error("User not found")

    const conversationId = formData.get("conversationId") as string
    const content = formData.get("content") as string

    if (!conversationId || !content || content.trim() === "") {
        throw new Error("Missing fields")
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId: conversationId,
                userId: user.id
            }
        }
    })

    if (!participant && user.role !== 'SYSTEM_ADMIN') {
        throw new Error("Not authorized to post in this conversation")
    }

    await prisma.$transaction([
        prisma.message.create({
            data: {
                conversationId: conversationId,
                authorId: user.id,
                content: content.trim()
            }
        }),
        prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() } // Bump conversation
        })
    ])

    revalidatePath(`/forum/calendar/chat/${conversationId}`)
    revalidatePath(`/forum/calendar`)
}
