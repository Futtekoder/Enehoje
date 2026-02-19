
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
            </div>
            {children}
        </div>
    )
}
