"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSwapRequest(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true },
    })

    if (!user?.share) {
        throw new Error("User has no share assigned")
    }

    const targetShareId = formData.get("targetShareId") as string
    const year = parseInt(formData.get("year") as string)
    const myWeek = parseInt(formData.get("myWeek") as string)
    const targetWeek = parseInt(formData.get("targetWeek") as string)
    const message = formData.get("message") as string

    if (!targetShareId || !year || !myWeek || !targetWeek) {
        throw new Error("Missing required fields")
    }

    await prisma.$transaction(async (tx) => {
        const swapRequest = await tx.swapRequest.create({
            data: {
                requestingShareId: user.share!.id,
                receivingShareId: targetShareId,
                year: year,
                weekA: myWeek,
                weekB: targetWeek,
                status: "PENDING",
            },
        })

        if (message && message.trim() !== "") {
            await tx.swapMessage.create({
                data: {
                    swapRequestId: swapRequest.id,
                    authorId: user.id,
                    content: message.trim(),
                }
            })
        }
    })

    revalidatePath("/dashboard")
    redirect("/dashboard")
}

export async function acceptSwap(swapId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Verify ownership
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true },
    })

    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId },
    })

    if (!swap) throw new Error("Swap not found")
    if (swap.receivingShareId !== user?.share?.id) throw new Error("Not authorized to accept this swap")

    // Execute the Swap (Update Weeks)
    // Logic: 
    // 1. Create/Update Week record for Week A -> Assigned to Receiving Share (Source: SWAP)
    // 2. Create/Update Week record for Week B -> Assigned to Requesting Share (Source: SWAP)

    await prisma.$transaction(async (tx) => {
        // Update Swap Status
        await tx.swapRequest.update({
            where: { id: swapId },
            data: { status: 'ACCEPTED' }
        })

        // Assign Week A (originally Requestor's) to Receiver
        await tx.week.upsert({
            where: { year_weekNumber: { year: swap.year, weekNumber: swap.weekA } },
            create: {
                year: swap.year,
                weekNumber: swap.weekA,
                shareId: swap.receivingShareId,
                source: 'SWAP'
            },
            update: {
                shareId: swap.receivingShareId,
                source: 'SWAP'
            }
        })

        // Assign Week B (originally Receiver's) to Requestor
        await tx.week.upsert({
            where: { year_weekNumber: { year: swap.year, weekNumber: swap.weekB } },
            create: {
                year: swap.year,
                weekNumber: swap.weekB,
                shareId: swap.requestingShareId,
                source: 'SWAP'
            },
            update: {
                shareId: swap.requestingShareId,
                source: 'SWAP'
            }
        })
    })

    revalidatePath("/dashboard")
}

export async function rejectSwap(swapId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Verify ownership
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true },
    })

    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId },
    })

    if (!swap) throw new Error("Swap not found")
    if (swap.receivingShareId !== user?.share?.id) throw new Error("Not authorized to reject this swap")

    await prisma.swapRequest.update({
        where: { id: swapId },
        data: { status: 'REJECTED' }
    })

    revalidatePath("/dashboard")
}
