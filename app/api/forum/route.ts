import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { sendForumNotification } from "@/lib/forum-email"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { title, content, attachmentIds } = body

        if (!title || !content) {
            return new NextResponse("Title and content are required", { status: 400 })
        }

        // 1. Create the Thread and the initial Post in one transaction
        const thread = await prisma.forumThread.create({
            data: {
                title,
                createdByUserId: session.user.id,
                sourceType: 'WEB',
                posts: {
                    create: {
                        content,
                        authorUserId: session.user.id,
                        sourceType: 'WEB',
                    }
                }
            },
            include: {
                posts: true // Need the post ID to attach files
            }
        })

        const firstPost = thread.posts[0]

        // 2. Link Attachments to the newly created Post (if any)
        if (attachmentIds && Array.isArray(attachmentIds) && attachmentIds.length > 0) {
            await prisma.attachment.updateMany({
                where: {
                    id: { in: attachmentIds },
                    uploadedByUserId: session.user.id // Security check
                },
                data: {
                    forumPostId: firstPost.id,
                    forumThreadId: thread.id // Optional top-level relation
                }
            })
        }

        // Outbound Email Notification (fire and forget)
        sendForumNotification(thread.id, firstPost.id)

        return NextResponse.json(thread)
    } catch (error) {
        console.error("Error creating forum thread:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
