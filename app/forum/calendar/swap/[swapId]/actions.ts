"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function sendSwapMessage(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true }
    })

    if (!user?.share) throw new Error("Unauthorized")

    const swapId = formData.get("swapId") as string
    const content = formData.get("content") as string

    if (!swapId || !content || content.trim() === "") {
        throw new Error("Missing fields")
    }

    // Verify user is part of the swap
    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId }
    })

    if (!swap) throw new Error("Swap not found")

    if (swap.requestingShareId !== user.share.id && swap.receivingShareId !== user.share.id) {
        throw new Error("You are not authorized to message on this swap")
    }

    await prisma.swapMessage.create({
        data: {
            swapRequestId: swapId,
            authorId: user.id,
            content: content.trim()
        }
    })

    revalidatePath(`/forum/calendar/swap/${swapId}`)
    revalidatePath(`/forum/calendar`)
}
