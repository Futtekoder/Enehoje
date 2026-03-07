import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { deleteAttachmentAndFile } from "@/lib/s3-utils"

export async function DELETE(
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
        const user = session.user

        const thread = await prisma.forumThread.findUnique({
            where: { id: threadId },
            include: {
                attachments: true,
                posts: {
                    include: { attachments: true }
                }
            }
        })

        if (!thread) {
            return new NextResponse("Thread not found", { status: 404 })
        }

        // Authorization: SYSTEM_ADMIN, ANDEL_ADMIN, or original author
        const isAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ANDEL_ADMIN'
        if (thread.createdByUserId !== user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // 1. Delete all attachments from S3 physically
        // We pass isAdmin=true to force deletion since we've already authorized the thread removal
        for (const attachment of thread.attachments) {
            await deleteAttachmentAndFile(attachment.id, session.user.id, true)
        }
        for (const post of thread.posts) {
            for (const attachment of post.attachments) {
                await deleteAttachmentAndFile(attachment.id, session.user.id, true)
            }
        }

        // 2. The database records for posts and attachments should be cascade deleted by Prisma if modeled correctly,
        // but we delete the thread here, which triggers the cascade on the DB side.
        await prisma.forumThread.delete({
            where: { id: threadId }
        })

        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        console.error("Error deleting forum thread:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
