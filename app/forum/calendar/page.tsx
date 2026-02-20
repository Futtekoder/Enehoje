import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CalendarForumPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true }
    })

    if (!user?.share) {
        return (
            <div className="container mx-auto p-6 text-center">
                Du skal være tilknyttet en andel for at se kalender-forummet.
            </div>
        )
    }

    // 1. Fetch General Discussions for "calendar"
    const generalPosts = await prisma.post.findMany({
        where: { category: "calendar" },
        include: { author: { include: { share: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for now, or add pagination later
    })

    // 2. Fetch Swap Requests involving user's share (Private Chats)
    const swapChats = await prisma.swapRequest.findMany({
        where: {
            OR: [
                { requestingShareId: user.share.id },
                { receivingShareId: user.share.id }
            ]
        },
        include: {
            requestingShare: true,
            receivingShare: true,
            _count: { select: { messages: true } },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1, // Get latest message for preview
                include: { author: { select: { name: true } } }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Link href="/forum" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Tilbage til Forum Oversigt</Link>

            <h1 className="text-3xl font-bold mb-8">Kalender & Bytte</h1>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Column 1: General Discussions */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-2xl font-semibold">Generel Debat</h2>
                        <Link href={`/forum/calendar/new`} className="text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 transition">
                            Nyt Indlæg
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {generalPosts.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">Ingen generelle indlæg endnu.</p>
                        ) : (
                            generalPosts.map(post => (
                                <Link key={post.id} href={`/forum/thread/${post.id}`} className="block p-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm hover:shadow-md transition">
                                    <h3 className="font-semibold text-lg">{post.title}</h3>
                                    <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                        <span>Fra: {post.author.share?.name || "Ingen andel"}</span>
                                        <span>{post._count.comments} kommentarer</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Column 2: Private Swap Chats */}
                <div className="space-y-6">
                    <div className="border-b pb-2">
                        <h2 className="text-2xl font-semibold">Dine Bytteanmodninger</h2>
                        <p className="text-sm text-gray-500 mt-1">Privat chat for dine aktive og tidligere bytteønsker.</p>
                    </div>

                    <div className="space-y-4">
                        {swapChats.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed">
                                <p className="text-gray-500 italic text-sm">Ingen bytteanmodninger endnu.</p>
                                <Link href="/dashboard/swap" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Opret et bytteønske</Link>
                            </div>
                        ) : (
                            swapChats.map(chat => {
                                const isRequester = chat.requestingShareId === user.share!.id
                                const otherShare = isRequester ? chat.receivingShare : chat.requestingShare
                                const latestMessage = chat.messages[0]

                                return (
                                    <Link key={chat.id} href={`/forum/calendar/swap/${chat.id}`} className="block p-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm hover:shadow-md transition relative overflow-hidden">
                                        {/* Status Indicator Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${chat.status === 'PENDING' ? 'bg-orange-400' :
                                                chat.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />

                                        <div className="ml-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    Chat med {otherShare.name}
                                                </h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800">
                                                    {chat.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                                                Bytte: Uge {chat.weekA} &harr; Uge {chat.weekB}
                                            </p>

                                            {latestMessage ? (
                                                <p className="text-xs text-gray-500 truncate border-t pt-2 mt-2">
                                                    <span className="font-semibold">{latestMessage.author.name}:</span> {latestMessage.content}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic border-t pt-2 mt-2">Ingen beskeder endnu.</p>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
