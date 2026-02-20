import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { sendChatMessage } from "./actions"

export default async function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const { conversationId } = await params
    const session = await auth()
    if (!session?.user?.email) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { share: true }
    })

    if (!user) return <div>Unauthorized</div>

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: { include: { user: { include: { share: true } } } },
            swapRequest: { include: { requestingShare: true, receivingShare: true } },
            messages: {
                include: { author: { include: { share: true } } },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!conversation) return <div>Conversation not found</div>

    // Security: Is current user a participant?
    const isParticipant = conversation.participants.some(p => p.userId === user.id)
    if (!isParticipant && user.role !== 'SYSTEM_ADMIN') {
        return <div className="p-6 text-center text-red-600">Du har ikke adgang til denne private chat.</div>
    }

    // Determine Title
    let chatTitle = "Samtale"
    if (conversation.title) chatTitle = conversation.title
    else if (conversation.swapRequest) {
        const isRequester = conversation.swapRequest.requestingShareId === user.share?.id
        const otherShare = isRequester ? conversation.swapRequest.receivingShare : conversation.swapRequest.requestingShare
        chatTitle = `Bytte med ${otherShare?.name || 'Ukendt'}`
    } else {
        const otherUsers = conversation.participants.filter(p => p.userId !== user.id).map(p => p.user.name || p.user.email)
        chatTitle = otherUsers.length > 0 ? otherUsers.join(", ") : "Tom Samtale"
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-3xl flex flex-col h-[calc(100vh-80px)]">
            <Link href="/forum/calendar" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Tilbage til Oversigt</Link>

            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-t-2xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        {chatTitle}
                    </h1>
                    {conversation.swapRequest && (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-medium">
                            Vedrørende bytte af uge {conversation.swapRequest.weekA} og {conversation.swapRequest.weekB} ({conversation.swapRequest.year})
                        </p>
                    )}
                </div>
                {conversation.swapRequest && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${conversation.swapRequest.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            conversation.swapRequest.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {conversation.swapRequest.status}
                    </div>
                )}
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-6 border-x border-gray-200 dark:border-zinc-800 flex flex-col gap-4">
                {conversation.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                        Ingen beskeder endnu. Start samtalen nedenfor.
                    </div>
                ) : (
                    conversation.messages.map(msg => {
                        const isMe = msg.authorId === user.id
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="text-xs text-gray-400 mb-1 px-1">
                                    {isMe ? 'Dig' : msg.author.name} ({msg.author.share?.name})
                                </div>
                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(msg.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-b-2xl p-4 shadow-sm">
                <form action={sendChatMessage} className="flex gap-2">
                    <input type="hidden" name="conversationId" value={conversation.id} />
                    <input
                        type="text"
                        name="content"
                        required
                        placeholder="Skriv en besked..."
                        className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}
