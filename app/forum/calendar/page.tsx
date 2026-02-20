import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MessageCircle, ArrowRightLeft } from "lucide-react"

export default async function CalendarForumPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true }
    })

    if (!user) return <div>Unauthorized</div>

    // 1. Fetch General Discussions for "calendar"
    const generalPosts = await prisma.post.findMany({
        where: { category: "calendar" },
        include: { author: { include: { share: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for now, or add pagination later
    })

    // 2. Fetch User's Conversations (Private Chats)
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: user.id }
            }
        },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1, // Get latest message for preview
                include: { author: { select: { name: true } } }
            },
            participants: {
                include: { user: { include: { share: true } } }
            },
            swapRequest: {
                include: { requestingShare: true, receivingShare: true }
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

                {/* Column 2: Private Chats */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <div>
                            <h2 className="text-2xl font-semibold">Private Beskeder</h2>
                            <p className="text-sm text-gray-500 mt-1">Personlige og delte samtaler grupperet her.</p>
                        </div>
                        <Link href={`/forum/calendar/chat/new`} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition flex items-center gap-1 shadow-sm">
                            <MessageCircle className="w-4 h-4" /> Ny Chat
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {conversations.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed">
                                <p className="text-gray-500 italic text-sm mb-2">Du har ingen private samtaler endnu.</p>
                                <p className="text-gray-400 text-xs text-balance">Start en ny chat eller opret et bytteønske med besked for at se den her.</p>
                            </div>
                        ) : (
                            conversations.map(chat => {
                                const latestMessage = chat.messages[0]

                                // Determine Chat Title
                                let chatTitle = "Samtale"
                                if (chat.title) {
                                    chatTitle = chat.title
                                } else if (chat.swapRequest) {
                                    // It's a swap chat
                                    const isRequester = chat.swapRequest.requestingShareId === user.share?.id
                                    const otherShare = isRequester ? chat.swapRequest.receivingShare : chat.swapRequest.requestingShare
                                    chatTitle = `Bytte med ${otherShare?.name || 'Ukendt'}`
                                } else {
                                    // Generate title from other participants
                                    const otherUsers = chat.participants.filter(p => p.userId !== user.id).map(p => p.user.name || p.user.email)
                                    if (otherUsers.length > 0) {
                                        chatTitle = otherUsers.join(", ")
                                        if (chatTitle.length > 30) chatTitle = chatTitle.substring(0, 27) + "..."
                                    } else {
                                        chatTitle = "Tom Samtale"
                                    }
                                }

                                return (
                                    <Link key={chat.id} href={`/forum/calendar/chat/${chat.id}`} className="block p-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm hover:shadow-md transition relative overflow-hidden group">

                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                {chat.swapRequest ? <ArrowRightLeft className="w-4 h-4 text-orange-500" /> : <MessageCircle className="w-4 h-4 text-blue-500" />}
                                                {chatTitle}
                                            </h3>
                                            {chat.swapRequest && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 border">
                                                    {chat.swapRequest.status}
                                                </span>
                                            )}
                                        </div>

                                        {chat.swapRequest && (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2 bg-orange-50 dark:bg-orange-900/10 inline-block px-1.5 py-0.5 rounded">
                                                Uge {chat.swapRequest.weekA} &harr; Uge {chat.swapRequest.weekB}
                                            </p>
                                        )}

                                        {latestMessage ? (
                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                <span className="font-semibold">{latestMessage.author.name}:</span> {latestMessage.content}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic mt-1">Ingen beskeder endnu.</p>
                                        )}
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
