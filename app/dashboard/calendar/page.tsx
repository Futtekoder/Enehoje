
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { WeekGrid } from "@/components/WeekGrid"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { SwapButtons } from "../swap-buttons" // Updated import path
import { Calendar, ArrowRightLeft, MessageSquare, Plus } from "lucide-react"

export default async function CalendarPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            share: {
                select: {
                    id: true,
                    name: true,
                    color: true,
                    // voteWeight excluded
                }
            }
        },
    })

    // Fetch swaps
    const incomingSwaps = user?.share ? await prisma.swapRequest.findMany({
        where: { receivingShareId: user.share.id, status: 'PENDING' },
        include: {
            requestingShare: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    }) : []

    const outgoingSwaps = user?.share ? await prisma.swapRequest.findMany({
        where: { requestingShareId: user.share.id, status: 'PENDING' },
        include: {
            receivingShare: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    }) : []

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ugeplan & Bytte</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Her kan du se fordelingen af uger og anmode om bytte.
                    </p>
                </div>
                {user?.share && (
                    <Link
                        href="/dashboard/swap"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Opret Bytteønske
                    </Link>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Calendar Section - Spans 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Årsoversigt 2025</h2>
                        </div>
                        <WeekGrid year={2025} />
                    </div>
                </div>

                {/* Sidebar - Swaps & Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <ArrowRightLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bytteønsker</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Incoming Swaps */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-1">Indgående</h3>
                                {incomingSwaps.length > 0 ? (
                                    <ul className="space-y-3">
                                        {incomingSwaps.map(swap => (
                                            <li key={swap.id} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                                                <div className="text-sm mb-3 text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{swap.requestingShare.name}</span> vil bytte uge <span className="font-bold bg-white dark:bg-black px-1.5 rounded">{swap.weekA}</span> for din uge <span className="font-bold bg-white dark:bg-black px-1.5 rounded">{swap.weekB}</span>
                                                </div>
                                                <SwapButtons swapId={swap.id} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 pl-1">Ingen indgående forespørgsler.</p>
                                )}
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-zinc-800" />

                            {/* Outgoing Swaps */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-1">Udgående</h3>
                                {outgoingSwaps.length > 0 ? (
                                    <ul className="space-y-3">
                                        {outgoingSwaps.map(swap => (
                                            <li key={swap.id} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Du har spurgt <span className="font-semibold text-gray-900 dark:text-white">{swap.receivingShare.name}</span> om uge <span className="font-bold bg-white dark:bg-black px-1.5 rounded text-gray-900 dark:text-white">{swap.weekB}</span> for din uge <span className="font-bold bg-white dark:bg-black px-1.5 rounded text-gray-900 dark:text-white">{swap.weekA}</span>
                                                </div>
                                                <div className="mt-2 text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 inline-block px-2 py-1 rounded">Afventer svar</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 pl-1">Ingen udgående forespørgsler.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
