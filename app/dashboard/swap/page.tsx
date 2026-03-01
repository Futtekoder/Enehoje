import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { createSwapRequest } from "../actions"
import { Calendar, ArrowRightLeft, UserCircle2, MessageSquareText, HelpCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SwapPage() {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { share: true },
    })

    if (!user?.share) {
        return <div>You must be assigned to a Share to swap weeks.</div>
    }

    // Get all shares for the dropdown
    const allShares = await prisma.share.findMany()
    const otherShares = allShares.filter(s => s.id !== user.share?.id)

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-3xl min-h-[80vh] flex flex-col justify-center">

            <Link href="/ugeplan" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition group mb-8 w-fit">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Tilbage til Ugeplan
            </Link>

            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Decorative background flare */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <ArrowRightLeft className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Opret Bytteønske</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Anmod om at bytte uger med en anden andel</p>
                        </div>
                    </div>

                    <form action={createSwapRequest} className="space-y-6">

                        {/* Year Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                Hvilket år gælder det for?
                            </label>
                            <input
                                type="number"
                                name="year"
                                defaultValue={new Date().getFullYear()}
                                className="w-full xl:w-1/3 p-3.5 bg-gray-50 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border-2 border-transparent focus:border-orange-500 rounded-xl transition-all shadow-inner text-lg font-semibold"
                            />
                        </div>

                        {/* Visual Swap Area */}
                        <div className="bg-gray-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700/50 flex flex-col md:flex-row items-center gap-6 justify-between relative">

                            {/* My Week */}
                            <div className="w-full">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                    Min Uge
                                    <span className="text-xs font-normal text-gray-400 font-mono tracking-tighter bg-gray-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Gives Væk</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">Uge</span>
                                    <input
                                        type="number"
                                        name="myWeek"
                                        className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all shadow-sm text-xl font-black placeholder:text-gray-300 text-center md:text-left"
                                        placeholder="7"
                                    />
                                </div>
                            </div>

                            {/* Arrow Divider */}
                            <div className="shrink-0 bg-white dark:bg-zinc-800 p-3 rounded-full shadow-lg border relative z-10 rotate-90 md:rotate-0">
                                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Target Week */}
                            <div className="w-full">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center justify-end md:justify-start gap-2 mb-2">
                                    Ønsket Uge
                                    <span className="text-xs font-normal text-orange-500 font-mono tracking-tighter bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">Modtages</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">Uge</span>
                                    <input
                                        type="number"
                                        name="targetWeek"
                                        className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-orange-500 rounded-xl transition-all shadow-sm text-xl font-black placeholder:text-gray-300 text-center md:text-left"
                                        placeholder="12"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Target Share Dropdown */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <UserCircle2 className="w-4 h-4 text-orange-500" />
                                Hvem ejer den ønskede uge nu?
                            </label>
                            <div className="relative">
                                <select name="targetShareId" className="w-full p-4 bg-gray-50 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border-2 border-transparent focus:border-orange-500 rounded-xl transition-all shadow-inner appearance-none font-semibold cursor-pointer z-10 relative bg-transparent">
                                    <option value="" disabled selected>Vælg modtager andel...</option>
                                    {otherShares.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Optional Message */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MessageSquareText className="w-4 h-4 text-blue-500" />
                                Læg en besked (Valgfrit)
                            </label>
                            <textarea
                                name="message"
                                rows={3}
                                className="w-full p-4 bg-gray-50 hover:bg-white dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all shadow-inner resize-none"
                                placeholder="Hej! Jeg vil høre om vi kan bytte denne uge..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button type="submit" className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                <div className="absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg"></div>
                                <span className="relative z-10 flex items-center gap-2 text-lg">
                                    Send Bytteanmodning
                                    <ArrowRightLeft className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
