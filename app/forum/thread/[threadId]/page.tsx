import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { addComment } from "../../actions"
import Link from "next/link"

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
    const { threadId } = await params
    const session = await auth()

    const post = await prisma.post.findUnique({
        where: { id: threadId },
        include: {
            author: { include: { share: true } },
            comments: { include: { author: { include: { share: true } } }, orderBy: { createdAt: 'asc' } },
            attachments: true
        }
    })

    if (!post) return <div>Indlæg ikke fundet.</div>

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Link href={`/forum/${post.category}`} className="text-blue-600 hover:underline mb-4 block">&larr; Tilbage</Link>

            <div className="bg-white dark:bg-zinc-900 border rounded shadow p-6 mb-6">
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <div className="text-gray-500 text-sm mb-4 border-b pb-4">
                    Skrevet af {post.author.name} ({post.author.share?.name}) • {post.createdAt.toLocaleDateString()}
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-wrap">
                    {post.content}
                </div>

                {post.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="font-semibold text-sm mb-2">Vedhæftede filer:</h3>
                        <ul className="space-y-1">
                            {post.attachments.map(att => (
                                <li key={att.id}>
                                    <a href={att.url} target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                                        📎 {att.filename} ({Math.round(att.size / 1024)} KB)
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Kommentarer ({post.comments.length})</h3>
                <div className="space-y-4">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-zinc-800 p-4 rounded border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">{comment.author.name} ({comment.author.share?.name})</span>
                                <span className="text-xs text-gray-500">{comment.createdAt.toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {session?.user && (
                <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded">
                    <h3 className="font-semibold mb-2">Skriv en kommentar</h3>
                    <form action={addComment}>
                        <input type="hidden" name="postId" value={post.id} />
                        <textarea name="content" required rows={3} className="w-full p-2 border rounded mb-2" placeholder="Skriv dit svar her..." />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Send Svar</button>
                    </form>
                </div>
            )}
        </div>
    )
}
