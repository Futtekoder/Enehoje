import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Archive, Clock, Paperclip, ChevronRight, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { da } from "date-fns/locale"

export default async function ForumArchivePage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/")
    }

    // Fetch archived threads sorted by latest activity
    // Note: We currently just rely on the ARCHIVED status, but this could also be expanded
    // to filter active threads older than a certain date if an automated script isn't running.
    const threads = await prisma.forumThread.findMany({
        where: { status: 'ARCHIVED' },
        include: {
            createdBy: { select: { name: true, image: true } },
            _count: { select: { posts: true, attachments: true } }
        },
        orderBy: { lastPostAt: 'desc' }
    })

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 relative z-10">
            {/* Header Section */}
            <div className="mb-10">
                <Link href="/forum" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Tilbage til det aktive forum
                </Link>

                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm flex items-center gap-3">
                    <Archive className="w-8 h-8 text-gray-400" />
                    Historik
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl mt-4 leading-relaxed">
                    Tidligere diskussioner som ikke længere er aktive, for at holde det primære forum overskueligt. Trådene her kan stadig læses.
                </p>
            </div>

            {/* Threads List */}
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800/80 overflow-hidden mb-8">
                {threads.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <Archive className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Historikken er tom</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Gamle samtaler vil automatisk blive flyttet hertil, så hovedsiden forbliver pæn.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {threads.map((thread) => (
                            <Link
                                key={thread.id}
                                href={`/forum/${thread.id}`}
                                className="block p-5 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group relative opacity-80 hover:opacity-100"
                            >
                                <div className="flex items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                {thread.title}
                                            </h2>
                                            {thread._count.attachments > 0 && (
                                                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium text-gray-500 dark:text-gray-500 flex-wrap">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0 ring-1 ring-gray-100 opacity-70">
                                                    {thread.createdBy.image ? (
                                                        <img src={thread.createdBy.image} alt="" className="w-full h-full object-cover grayscale" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                            {thread.createdBy.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="truncate max-w-[120px]">{thread.createdBy.name?.split(' ')[0]}</span>
                                            </div>

                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0"></div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="opacity-70">{thread._count.posts} {thread._count.posts === 1 ? 'svar' : 'svar'}</span>
                                            </div>

                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0"></div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Clock className="w-4 h-4 opacity-70" />
                                                <span suppressHydrationWarning>
                                                    {formatDistanceToNow(thread.lastPostAt, { addSuffix: true, locale: da })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors hidden sm:block">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
