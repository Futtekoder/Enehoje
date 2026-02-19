"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { s3Client, BUCKET_NAME } from "@/lib/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export async function createPost(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const file = formData.get("file") as File

    if (!title || !content || !category) throw new Error("Missing fields")

    const post = await prisma.post.create({
        data: {
            title,
            content,
            category,
            authorId: user.id,
        },
    })

    // Handle File Upload (S3)
    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`

        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: file.type,
                ACL: 'public-read', // Make it public if your bucket allows
            }))

            // Construct public URL (This depends on your provider)
            // AWS S3: https://BUCKET.s3.REGION.amazonaws.com/FILENAME
            // R2/Spaces: Custom domain or endpoint
            const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

            await prisma.attachment.create({
                data: {
                    postId: post.id,
                    url: url,
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size
                }
            })
        } catch (error) {
            console.error("S3 Upload failed", error)
            // Continue without attachment or throw?
            // For now, let's log and continue
        }
    }

    revalidatePath(`/forum/${category}`)
    redirect(`/forum/${category}`)
}

export async function addComment(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    const content = formData.get("content") as string
    const postId = formData.get("postId") as string

    if (!content || !postId) throw new Error("Missing fields")

    await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: user!.id,
        },
    })

    revalidatePath(`/forum/thread/${postId}`)
}
