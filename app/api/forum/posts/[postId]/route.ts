import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { deleteAttachmentAndFile } from "@/lib/s3-utils"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params
        const postId = resolvedParams.postId
        const user = session.user

        const post = await prisma.forumPost.findUnique({
            where: { id: postId },
            include: {
                attachments: true,
                thread: {
                    include: {
                        posts: { select: { id: true } }
                    }
                }
            }
        })

        if (!post) {
            return new NextResponse("Post not found", { status: 404 })
        }

        // Authorization: SYSTEM_ADMIN, ANDEL_ADMIN, or original author
        const isAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ANDEL_ADMIN'
        if (post.authorUserId !== user.id && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // 1. Delete all attachments from S3 physically
        for (const attachment of post.attachments) {
            await deleteAttachmentAndFile(attachment.id, session.user.id, true) // Pass isAdmin=true as we authorized the post
        }

        // 2. Check if this is the ONLY post in the thread
        if (post.thread.posts.length <= 1) {
            // Delete the entire thread if this is the last post
            await prisma.forumThread.delete({
                where: { id: post.threadId }
            })
        } else {
            // Otherwise just delete the post
            await prisma.forumPost.delete({
                where: { id: postId }
            })
        }

        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        console.error("Error deleting forum post:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
