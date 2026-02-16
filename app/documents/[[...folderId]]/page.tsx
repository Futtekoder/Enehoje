import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Folder as FolderIcon, FileText } from "lucide-react"

export default async function DocumentsPage({ params }: { params: Promise<{ folderId?: string[] }> }) {
    const resolvedParams = await params
    // Handle optional catch-all route: folderId is string[] or undefined
    const rawFolderId = resolvedParams?.folderId
    const folderId = Array.isArray(rawFolderId) && rawFolderId.length > 0
        ? rawFolderId[rawFolderId.length - 1]
        : undefined

    const session = await auth()

    // Fetch folders and documents
    const folders = await prisma.folder.findMany({
        where: { parentId: folderId || null },
        orderBy: { name: 'asc' }
    })

    const documents = await prisma.document.findMany({
        where: { folderId: folderId || null },
        orderBy: { title: 'asc' }
    })

    const currentFolder = folderId ? await prisma.folder.findUnique({ where: { id: folderId } }) : null

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/documents" className="text-2xl font-bold hover:underline">Dokumentarkiv</Link>
                {currentFolder && (
                    <>
                        <span className="text-gray-400">/</span>
                        <span className="text-2xl font-bold">{currentFolder.name}</span>
                    </>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folderId && (
                    <Link href={currentFolder?.parentId ? `/documents/${currentFolder.parentId}` : "/documents"} className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-50 text-gray-500">
                        <span className="text-xl mb-2">..</span>
                        <span className="text-sm">Op</span>
                    </Link>
                )}

                {folders.map(folder => (
                    <Link key={folder.id} href={`/documents/${folder.id}`} className="p-4 border rounded flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                        <FolderIcon size={32} className="mb-2" />
                        <span className="text-center font-medium">{folder.name}</span>
                    </Link>
                ))}

                {documents.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <FileText size={32} className="mb-2 text-gray-400" />
                        <span className="text-center font-medium">{doc.title}</span>
                    </a>
                ))}

                {folders.length === 0 && documents.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        Denne mappe er tom.
                    </div>
                )}
            </div>
        </div>
    )
}
