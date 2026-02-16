import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params
    const session = await auth()

    // Find posts in this category
    // Note: categoryId matches the 'category' string field in Post model for now
    // Real app might use a Category model, but spec was simple.
    const posts = await prisma.post.findMany({
        where: { category: categoryId },
        include: { author: { include: { share: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' }
    })

    // Map slug to display name
    const categoryNames: Record<string, string> = {
        general: "Generelt",
        maintenance: "Vedligehold",
        calendar: "Kalender",
        economy: "Økonomi",
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/forum" className="text-blue-600 hover:underline mb-2 block">&larr; Tilbage til Forum</Link>
                    <h1 className="text-3xl font-bold">{categoryNames[categoryId] || categoryId}</h1>
                </div>
                <Link href={`/forum/${categoryId}/new`} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Nyt Indlæg
                </Link>
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <p className="text-gray-500 italic">Ingen indlæg i denne kategori endnu.</p>
                ) : (
                    posts.map(post => (
                        <Link key={post.id} href={`/forum/thread/${post.id}`} className="block p-6 border rounded shadow hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                            <h2 className="text-xl font-semibold">{post.title}</h2>
                            <div className="text-sm text-gray-500 mt-2 flex justify-between">
                                <span>
                                    Af {post.author.name || post.author.email} ({post.author.share?.name || "Ingen andel"})
                                </span>
                                <span>
                                    {post._count.comments} kommentarer
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
