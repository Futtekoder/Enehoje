import { prisma } from "@/lib/db"

export async function canViewEvent(userId: string, eventId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { memberships: true }
    })

    if (!user || user.status !== "APPROVED") return false
    if (user.role === "SYSTEM_ADMIN") return true

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { groups: { include: { members: true } } }
    })

    if (!event) return false

    if (event.visibility === "ADMINS_ONLY" && user.role === "MEMBER") {
        return false
    }

    if (event.scope === "ALL_MEMBERS") return true

    if (event.scope === "SHARE") {
        return user.memberships.some(m => m.shareId === event.shareId)
    }

    if (event.scope === "MIXED_GROUP") {
        if (event.createdByUserId === userId) return true

        for (const group of event.groups) {
            if (group.members.some(m => m.userId === userId)) return true
        }
        return false
    }

    return false
}

export async function canApproveTasks(userId: string, eventId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { memberships: true }
    })

    if (!user || user.status !== "APPROVED") return false
    if (user.role === "SYSTEM_ADMIN") return true

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    })

    if (!event) return false

    if (event.scope === "ALL_MEMBERS") {
        // Only SYSTEM_ADMIN can approve tasks for ALL_MEMBERS events
        return false
    }

    if (event.scope === "SHARE") {
        // The Formand (Chair) of the associated share can approve
        return user.memberships.some(m => m.shareId === event.shareId && m.isChair)
    }

    if (event.scope === "MIXED_GROUP") {
        // Creator of the event can approve
        return event.createdByUserId === userId
    }

    return false
}
