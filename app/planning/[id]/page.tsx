import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { canViewEvent } from "@/lib/planning/auth"
import { EventDetailClient } from "./event-detail-client"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const resolvedParams = await params
    const eventId = resolvedParams.id

    // Hard Security Check
    const isAuthorized = await canViewEvent(session.user.id, eventId)
    if (!isAuthorized) {
        redirect("/planning")
    }

    // Fetch deep event data for hydration
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            share: true,
            createdByUser: { select: { name: true, image: true } },
            participations: {
                include: { user: { select: { id: true, name: true, image: true, role: true } } }
            },
            sailingWishes: {
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { desiredAt: 'asc' }
            },
            tasks: {
                include: {
                    createdByUser: { select: { id: true, name: true, image: true } },
                    approvedByUser: { select: { id: true, name: true } },
                    signups: { include: { user: { select: { id: true, name: true, image: true } } } },
                    votes: true
                },
                orderBy: { status: 'asc' } // Keep PROPOSED at top, DONE at bottom
            }
        }
    })

    if (!event) return notFound()

    return (
        <div className="bg-white min-h-screen dark:bg-gray-950">
            <EventDetailClient initialEvent={event} currentUser={session.user} />
        </div>
    )
}
