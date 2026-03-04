import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { DriftAdminClient } from "./drift-admin-client"

export default async function DriftAdminPage() {
    const session = await auth()
    if (session?.user?.role !== 'SYSTEM_ADMIN') {
        redirect("/")
    }

    // Fetch all existing drift data deeply nested
    const units = await prisma.operationUnit.findMany({
        orderBy: { order: 'asc' },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                include: {
                    checklist: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drift & Checklister</h1>
            <p className="text-gray-500 dark:text-gray-400">
                Administrer guides, videoer og checklister for ejendommens enheder (fx Villaen, Båden, Fyret).
                Offentlige guides vises på /drift, og understøtter lazy-loading for dårlige internetforbindelser.
            </p>

            <DriftAdminClient initialUnits={units} />
        </div>
    )
}
