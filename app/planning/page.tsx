import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { EventListClient } from "./event-list-client"

export default async function PlanningHubPage() {
    const session = await auth()

    // Redirect unauthenticated users
    if (!session?.user) {
        redirect("/")
    }

    if (session.user.status === "PENDING" || session.user.status === "REJECTED") {
        redirect("/pending")
    }

    const userWithShares = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: { include: { share: true } } }
    })

    // Pass user role and shares to the client
    const userRole = session.user.role
    const userShares = userWithShares?.memberships.map(m => m.share) || []

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 mb-2">
                    Planlægning & Weekender
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Få overblik over arrangementer, planlæg ankomst, og hjælp med at opdele praktiske opgaver på øen.
                </p>
            </div>

            <EventListClient userRole={userRole} userShares={userShares} />
        </div>
    )
}
