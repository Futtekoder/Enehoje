
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Double check against database to be sure (and get latest role)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    })

    if (!user || (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ANDEL_ADMIN')) {
        redirect("/dashboard")
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent inline-block">
                    Administrator Panel
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Administrer brugere, rettigheder og andele.
                </p>
                <div className="flex gap-4 mt-6">
                    <a href="/admin" className="text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Brugere</a>
                    <a href="/admin/calendar" className="text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 border-l border-gray-300 dark:border-zinc-700 pl-4">Kalender Opsætning</a>
                </div>
            </div>
            {children}
        </div>
    )
}
