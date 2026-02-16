import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { WeekGrid } from "@/components/WeekGrid"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { SwapButtons } from "./swap-buttons"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true },
    })

    // Fetch swaps
    const incomingSwaps = user?.share ? await prisma.swapRequest.findMany({
        where: { receivingShareId: user.share.id, status: 'PENDING' },
        include: { requestingShare: true }
    }) : []

    const outgoingSwaps = user?.share ? await prisma.swapRequest.findMany({
        where: { requestingShareId: user.share.id, status: 'PENDING' },
        include: { receivingShare: true }
    }) : []

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Ø-Forening Dashboard</h1>
                {user?.share && (
                    <Link href="/dashboard/swap" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Opret Bytteønske
                    </Link>
                )}
            </div>

            <p className="mb-6">Velkommen, {user?.name || session.user.email} ({user?.share?.name || "Ingen andel"})</p>

            <div className="grid grid-cols-1 gap-6">
                <div className="p-4 border rounded shadow bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-semibold mb-4">Årsoversigt (2025)</h2>
                    <WeekGrid year={2025} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded shadow bg-white dark:bg-zinc-900">
                        <h2 className="text-xl font-semibold mb-4">Bytteønsker</h2>

                        <div className="space-y-4">
                            {incomingSwaps.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 uppercase mb-2">Indgående (Handlinger krævet)</h3>
                                    <ul className="space-y-3">
                                        {incomingSwaps.map(swap => (
                                            <li key={swap.id} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700">
                                                <div className="text-sm mb-2">
                                                    <span className="font-semibold">{swap.requestingShare.name}</span> vil bytte uge <strong>{swap.weekA}</strong> for din uge <strong>{swap.weekB}</strong> ({swap.year})
                                                </div>
                                                <SwapButtons swapId={swap.id} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {outgoingSwaps.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 uppercase mb-2">Udgående (Afventer)</h3>
                                    <ul className="space-y-3">
                                        {outgoingSwaps.map(swap => (
                                            <li key={swap.id} className="text-sm p-3 bg-gray-50 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700">
                                                Du har bedt <span className="font-semibold">{swap.receivingShare.name}</span> om uge <strong>{swap.weekB}</strong> for din uge <strong>{swap.weekA}</strong> ({swap.year})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {incomingSwaps.length === 0 && outgoingSwaps.length === 0 && (
                                <p className="text-gray-500 italic">Ingen aktive bytteønsker.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border rounded shadow bg-white dark:bg-zinc-900">
                        <h2 className="text-xl font-semibold">Seneste Forumindlæg</h2>
                        <p className="text-gray-500 mt-2">Ingen nye indlæg.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
