import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Get full user profile with memberships to perform advanced filtering
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        })

        if (!user || user.status !== "APPROVED") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const scopeFilter = searchParams.get("scope") // ALL_MEMBERS, SHARE, MIXED_GROUP
        const mineFilter = searchParams.get("mine") === "true"

        // Basic Base Query: Fetch all events
        // Optimization: Filter at database level where possible

        let whereClause: any = {}

        if (scopeFilter) {
            whereClause.scope = scopeFilter
        }

        if (mineFilter) {
            // "Mine" events are ones where the user has participation OR is the creator
            whereClause.OR = [
                { participations: { some: { userId: user.id } } },
                { createdByUserId: user.id }
            ]
        }

        // Only APPROVED events? 
        whereClause.status = "PUBLISHED"

        const allEvents = await prisma.event.findMany({
            where: whereClause,
            include: {
                groups: { include: { members: true } },
                participations: true,
                tasks: true,
                sailingWishes: true
            },
            orderBy: { startAt: 'asc' }
        })

        // Memory Filter for Authorization Roles
        // Prevent users from seeing other Share's private events
        const filteredEvents = allEvents.filter(event => {
            if (user.role === "SYSTEM_ADMIN") return true

            if (event.visibility === "ADMINS_ONLY" && user.role === "MEMBER") return false

            if (event.scope === "ALL_MEMBERS") return true

            if (event.scope === "SHARE") {
                return user.memberships.some(m => m.shareId === event.shareId)
            }

            if (event.scope === "MIXED_GROUP") {
                if (event.createdByUserId === user.id) return true
                return event.groups.some(g => g.members.some(m => m.userId === user.id))
            }

            return false
        })

        return NextResponse.json(filteredEvents)
    } catch (error) {
        console.error("Error fetching events:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Get full user profile with memberships
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { memberships: true }
        })

        if (!user || user.status !== "APPROVED") {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await request.json()
        const { title, description, type, scope, startAt, endAt, shareId } = body

        if (!title || !type || !scope || !startAt || !endAt) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // Validate scope vs shareId
        if (scope === "SHARE") {
            if (!shareId) return new NextResponse("Share ID required for SHARE scope", { status: 400 })
            const isMember = user.memberships.some(m => m.shareId === shareId)
            const isAdmin = user.role === "SYSTEM_ADMIN" || user.role === "ANDEL_ADMIN"
            if (!isMember && !isAdmin) {
                return new NextResponse("Not a member of this share", { status: 403 })
            }
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                type,
                scope,
                startAt: new Date(startAt),
                endAt: new Date(endAt),
                shareId: scope === "SHARE" ? shareId : null,
                createdByUserId: user.id,
                status: "PUBLISHED",
                visibility: "MEMBERS"
            }
        })

        return NextResponse.json(newEvent)
    } catch (error) {
        console.error("Error creating event:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
