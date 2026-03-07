import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { sendForumNotification } from "@/lib/forum-email"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params
        const threadId = resolvedParams.id
        const body = await req.json()
        const { content, attachmentIds } = body

        if (!content) {
            return new NextResponse("Content is required", { status: 400 })
        }

        // 1. Verify thread exists and is active
        const thread = await prisma.forumThread.findUnique({
            where: { id: threadId }
        })

        if (!thread) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (thread.status === 'ARCHIVED') {
            return new NextResponse("Thread is read-only", { status: 403 })
        }

        // 2. Create the Post
        const post = await prisma.forumPost.create({
            data: {
                threadId,
                content,
                authorUserId: session.user.id,
                sourceType: 'WEB'
            }
        })

        // 3. Update Thread lastPostAt for sorting
        await prisma.forumThread.update({
            where: { id: threadId },
            data: { lastPostAt: new Date() }
        })

        // 4. Link Attachments to the newly created Post (if any)
        if (attachmentIds && Array.isArray(attachmentIds) && attachmentIds.length > 0) {
            await prisma.attachment.updateMany({
                where: {
                    id: { in: attachmentIds },
                    uploadedByUserId: session.user.id
                },
                data: {
                    forumPostId: post.id,
                    forumThreadId: thread.id
                }
            })
        }

        // Outbound Email Notification (fire and forget)
        sendForumNotification(threadId, post.id)

        return NextResponse.json(post)
    } catch (error) {
        console.error("Error creating forum reply:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
