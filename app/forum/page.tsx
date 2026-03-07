import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MessageSquarePlus, Clock, Paperclip, ChevronRight, Archive } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { da } from "date-fns/locale"

export default async function ForumPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/")
    }

    // Fetch active threads sorted by latest activity
    const threads = await prisma.forumThread.findMany({
        where: { status: 'ACTIVE' },
        include: {
            createdBy: { select: { name: true, image: true } },
            _count: { select: { posts: true, attachments: true } }
        },
        orderBy: { lastPostAt: 'desc' }
    })

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
                        Forum
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl leading-relaxed">
                        Her samles fælles diskussioner for Enehøje. Du kan starte en samtale her eller ved at sende en mail til <a href="mailto:forum@enehoje.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">forum@enehoje.com</a>.
                    </p>
                </div>

                <Link
                    href="/forum/new"
                    className="inline-flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                    <MessageSquarePlus className="w-5 h-5 mr-2" />
                    Start ny samtale
                </Link>
            </div>

            {/* Threads List */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-white/50 dark:border-zinc-800/50 overflow-hidden mb-8">
                {threads.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <MessageSquarePlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ingen aktive samtaler endnu</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Vær den første til at starte en diskussion i det nye forum.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {threads.map((thread) => (
                            <Link
                                key={thread.id}
                                href={`/forum/${thread.id}`}
                                className="block p-5 sm:p-6 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group relative"
                            >
                                <div className="flex items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {thread.title}
                                            </h2>
                                            {thread._count.attachments > 0 && (
                                                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 flex-wrap">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0 ring-1 ring-gray-100">
                                                    {thread.createdBy.image ? (
                                                        <img src={thread.createdBy.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                            {thread.createdBy.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="truncate max-w-[120px]">{thread.createdBy.name?.split(' ')[0]}</span>
                                            </div>

                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <MessageSquarePlus className="w-4 h-4 opacity-70" />
                                                <span>{thread._count.posts} {thread._count.posts === 1 ? 'svar' : 'svar'}</span>
                                            </div>

                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Clock className="w-4 h-4 opacity-70" />
                                                <span suppressHydrationWarning>
                                                    {formatDistanceToNow(thread.lastPostAt, { addSuffix: true, locale: da })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors hidden sm:block">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Archive Link */}
            <div className="flex justify-center">
                <Link
                    href="/forum/archive"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-zinc-900/50 px-5 py-2.5 rounded-full border border-gray-200 dark:border-zinc-800"
                >
                    <Archive className="w-4 h-4" />
                    Se historik
                </Link>
            </div>
        </div>
    )
}
