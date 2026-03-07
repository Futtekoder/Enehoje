import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { da } from "date-fns/locale"
import { ArrowLeft, Paperclip, Mail, MonitorSmartphone } from "lucide-react"
import { ThreadReplyClient } from "./thread-reply-client"
import { DeleteButton } from "./delete-button"

export default async function ForumThreadPage(
    props: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/")
    }

    const resolvedParams = await props.params
    const threadId = resolvedParams.id

    const thread = await prisma.forumThread.findUnique({
        where: { id: threadId },
        include: {
            createdBy: { select: { name: true, image: true, role: true } },
            relatedEvent: { select: { id: true, title: true } },
            posts: {
                orderBy: { createdAt: 'asc' },
                include: {
                    author: { select: { name: true, image: true, role: true } },
                    attachments: true
                }
            }
        }
    })

    if (!thread) {
        return (
            <div className="container mx-auto px-4 py-12 text-center relative z-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Samtalen findes ikke</h1>
                <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">
                    Tilbage til forum
                </Link>
            </div>
        )
    }

    const isAdmin = session.user.role === 'SYSTEM_ADMIN' || session.user.role === 'ANDEL_ADMIN'
    const canDeleteThread = session.user.id === thread.createdByUserId || isAdmin

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
            {/* Thread Header */}
            <div className="mb-6">
                <Link href="/forum" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Tilbage til oversigten
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight drop-shadow-sm leading-tight">
                    {thread.title}
                </h1>

                {thread.relatedEvent && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Denne diskussion er knyttet til arrangementet <span className="font-bold">'{thread.relatedEvent.title}'</span>
                        </div>
                        <Link
                            href={`/planning/${thread.relatedEvent.id}`}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            Gå til arrangement &rarr;
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800 pb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white dark:ring-zinc-900">
                            {thread.createdBy.image ? (
                                <img src={thread.createdBy.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                    {thread.createdBy.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{thread.createdBy.name?.split(' ')[0]}</span>
                    </div>

                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>

                    <span>Startet {format(thread.createdAt, 'd. MMMM yyyy', { locale: da })}</span>

                    {/* Thread Delete Action */}
                    <div className="ml-auto">
                        <DeleteButton id={thread.id} type="thread" canDelete={canDeleteThread} />
                    </div>
                </div>
            </div>

            {/* Posts List (Chronological) */}
            <div className="space-y-6 mb-10">
                {thread.posts.map((post) => {
                    const canDeletePost = session.user?.id === post.authorUserId || isAdmin

                    return (
                        <div key={post.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800/80 p-5 sm:p-8 flex gap-4 sm:gap-6">

                            {/* Author Avatar Column */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-sm">
                                    {post.author.image ? (
                                        <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                                            {post.author.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Post Content Column */}
                            <div className="flex-1 min-w-0">
                                {/* Post Meta */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                                    <span className="font-bold text-gray-900 dark:text-white text-base">
                                        {post.author.name}
                                    </span>

                                    {post.author.role === 'SYSTEM_ADMIN' || post.author.role === 'ANDEL_ADMIN' ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Admin</span>
                                    ) : null}

                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500" suppressHydrationWarning>
                                        {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: da })}
                                    </span>

                                    <div className="ml-auto flex items-center gap-2">
                                        {post.sourceType === 'EMAIL' ? (
                                            <div title="Sendt via E-mail"><Mail className="w-4 h-4 text-gray-300 dark:text-gray-600" /></div>
                                        ) : (
                                            <div title="Skrevet på Web"><MonitorSmartphone className="w-4 h-4 text-gray-300 dark:text-gray-600" /></div>
                                        )}
                                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1 hidden sm:block"></div>
                                        <DeleteButton id={post.id} type="post" canDelete={canDeletePost} />
                                    </div>
                                </div>

                                {/* Body (New lines preserved via whitespace-pre-wrap) */}
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-none whitespace-pre-wrap break-words">
                                    {post.content}
                                </div>

                                {/* Attachments */}
                                {post.attachments.length > 0 && (
                                    <div className="mt-6 space-y-2">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vedhæftede filer</div>
                                        <div className="flex flex-wrap gap-2">
                                            {post.attachments.map((file) => (
                                                <a
                                                    key={file.id}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-zinc-700 text-sm transition-colors group"
                                                >
                                                    <Paperclip className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 max-w-[200px] truncate">
                                                        {file.filename}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Reply Area Bottom Box */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                <ThreadReplyClient threadId={thread.id} />
                <div className="mt-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Svarer du her, sendes beskeden også ud til de andre medlemmer via mail 📬
                </div>
            </div>
        </div>
    )
}
