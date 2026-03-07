"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createLinkedDiscussion(eventId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify event exists and user can see it
    const event = await prisma.event.findUnique({
        where: { id: eventId }
    })

    if (!event) {
        throw new Error("Event not found")
    }

    // Check if a linked thread already exists
    const existingThread = await prisma.forumThread.findFirst({
        where: { relatedEventId: eventId }
    })

    if (existingThread) {
        redirect(`/forum/${existingThread.id}`)
    }

    // Build intro text
    const initialContent = `Denne tråd er oprettet fra arrangementet '${event.title}', så medlemmer kan koordinere og drøfte arrangementet i forum.`
    const assumedTitle = `${event.title} – diskussion`

    // Create the thread and link it 1:1
    const newThread = await prisma.forumThread.create({
        data: {
            title: assumedTitle,
            createdByUserId: session.user.id,
            sourceType: 'WEB',
            relatedEventId: event.id, // The context link bridge
            posts: {
                create: {
                    content: initialContent,
                    authorUserId: session.user.id,
                    sourceType: 'WEB',
                }
            }
        }
    })

    redirect(`/forum/${newThread.id}`)
}
