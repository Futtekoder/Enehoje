import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createConversation } from "./actions"

export default async function NewChatPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true } // Need user's share to exclude them maybe, or just use ID
    })
    if (!user) return <div>Unauthorized</div>

    // Get all other users in the system, ordered by Share for grouped display
    const allUsers = await prisma.user.findMany({
        where: { id: { not: user.id } },
        include: { share: true },
        orderBy: [
            { share: { name: 'asc' } },
            { name: 'asc' }
        ]
    })

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Link href="/forum/calendar" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Tilbage til Oversigt</Link>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">Ny Privat Samtale</h1>
                <p className="text-gray-500 mb-6">Start en snak med en eller flere beboere.</p>

                <form action={createConversation} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium mb-2">Deltagere (Vælg mindst én)</label>
                        <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                            {allUsers.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">Ingen andre brugere fundet.</p>
                            ) : (
                                allUsers.map(u => (
                                    <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer transition">
                                        <input
                                            type="checkbox"
                                            name="participants"
                                            value={u.id}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{u.name || u.email}</p>
                                            <p className="text-xs text-gray-500">{u.share?.name || "Ingen andel"}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Evt. gruppenavn</label>
                        <p className="text-xs text-gray-500 mb-2">Kan udfyldes hvis du vælger flere personer (f.eks. "Bestyrelsen")</p>
                        <input
                            type="text"
                            name="title"
                            className="w-full p-2 border rounded-xl bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800"
                            placeholder="Valgfrit..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Første Besked</label>
                        <textarea
                            name="initialMessage"
                            rows={3}
                            required
                            className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Skriv din besked..."
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition shadow-sm">
                        Start Samtale
                    </button>
                </form>
            </div>
        </div>
    )
}
