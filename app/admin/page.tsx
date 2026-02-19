
import { prisma } from "@/lib/db"
import { AdminUserTable } from "./user-table"

export default async function AdminPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { share: true }
    })

    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Totale Brugere</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Administratorer</div>
                    <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'SYSTEM_ADMIN').length}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Ufordelte Brugere</div>
                    <div className="text-3xl font-bold text-orange-500">{users.filter(u => !u.shareId).length}</div>
                </div>
            </div>

            <AdminUserTable users={users} shares={shares} />
        </div>
    )
}
