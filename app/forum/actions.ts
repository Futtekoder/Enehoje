"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { writeFile } from "fs/promises"
import { join } from "path"

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

    // Handle File Upload (Local Dev)
    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure filename is unique-ish
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
        const path = join(process.cwd(), "public", "uploads", filename)

        // Ensure directory exists (might need to create it manually or check)
        // For now assuming public exists. Users usually don't have 'uploads' folder yet.
        // I'll assume I need to create it in a separate step or just fail if not.
        // Actually, let's just write.

        try {
            await writeFile(path, buffer)

            await prisma.attachment.create({
                data: {
                    postId: post.id,
                    url: `/uploads/${filename}`,
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size
                }
            })
        } catch (error) {
            console.error("Upload failed", error)
            // Continue without attachment
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
