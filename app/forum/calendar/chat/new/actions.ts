"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createConversation(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    if (!user) throw new Error("User not found")

    // `formData.getAll` is used because checkboxes share the same 'name' attribute
    const participantIds = formData.getAll("participants") as string[]
    const title = formData.get("title") as string
    const initialMessage = formData.get("initialMessage") as string

    if (!participantIds || participantIds.length === 0) {
        throw new Error("Must select at least one participant")
    }
    if (!initialMessage || initialMessage.trim() === "") {
        throw new Error("Initial message is required")
    }

    // Prepare participants: Current user + selected users
    const participantsData = [
        { userId: user.id },
        ...participantIds.map(id => ({ userId: id }))
    ]

    const isGroup = participantIds.length > 1

    const conversation = await prisma.conversation.create({
        data: {
            title: title && title.trim() !== "" ? title.trim() : null,
            isGroup: isGroup,
            participants: {
                create: participantsData
            },
            messages: {
                create: {
                    authorId: user.id,
                    content: initialMessage.trim()
                }
            }
        }
    })

    revalidatePath("/forum/calendar")
    redirect(`/forum/calendar/chat/${conversation.id}`)
}
