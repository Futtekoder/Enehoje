import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AdminShareManager } from "./share-manager"

export default async function AdminSharesPage() {
    const session = await auth()
    if (session?.user?.role !== 'SYSTEM_ADMIN') {
        redirect("/")
    }

    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' },
        include: {
            memberships: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    })

    const allUsers = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            email: true
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Andele & Formænd</h1>
            <p className="text-gray-500 dark:text-gray-400">
                Administrer andele, tilføj/fjern medlemmer og udpeg en formand pr. andel. Hver andel kan kun have én formand.
            </p>

            <AdminShareManager shares={shares} allUsers={allUsers} />
        </div>
    )
}
