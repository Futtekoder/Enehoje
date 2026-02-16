"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPoll(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Check if admin (optional, skipping for MVP)

    const question = formData.get("question") as string
    const deadlineStr = formData.get("deadline") as string
    const options = formData.getAll("options") as string[]

    if (!question || options.length < 2) throw new Error("Invalid poll data")

    await prisma.poll.create({
        data: {
            question,
            deadline: deadlineStr ? new Date(deadlineStr) : undefined,
            options: {
                create: options.filter(o => o.trim() !== "").map(text => ({ text }))
            }
        }
    })

    revalidatePath("/polls")
    redirect("/polls")
}

export async function castVote(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    const pollId = formData.get("pollId") as string
    const optionId = formData.get("optionId") as string

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_pollId: {
                userId: user.id,
                pollId,
            }
        }
    })

    if (existingVote) {
        // For MVP, maybe allow changing vote? Or just error.
        // Let's error/ignore.
        throw new Error("Already voted")
    }

    await prisma.vote.create({
        data: {
            pollId,
            optionId,
            userId: user.id
        }
    })

    revalidatePath(`/polls/${pollId}`)
}
