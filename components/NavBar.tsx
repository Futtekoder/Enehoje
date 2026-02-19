import Link from "next/link"
import { auth } from "@/auth"
import { Home, MessageSquare, FileText, Vote, LogOut } from "lucide-react"

export async function NavBar() {
    const session = await auth()

    if (!session?.user) return null

    return (
        <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/dashboard" className="font-bold text-xl flex items-center gap-2">
                    <span>🏝️</span>
                    <span>Ø-Forening</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition text-sm font-medium">
                        <Home size={18} />
                        <span className="hidden md:inline">Oversigt</span>
                    </Link>

                    <Link href="/dashboard/calendar" className="flex items-center gap-2 hover:text-blue-600 transition text-sm font-medium">
                        {/* We use Calendar icon for the Week Plan */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
                        <span className="hidden md:inline">Ugeplan</span>
                    </Link>

                    <Link href="/forum" className="flex items-center gap-2 hover:text-blue-600 transition text-sm font-medium">
                        <MessageSquare size={18} />
                        <span className="hidden md:inline">Forum</span>
                    </Link>

                    <Link href="/documents" className="flex items-center gap-2 hover:text-blue-600 transition text-sm font-medium">
                        <FileText size={18} />
                        <span className="hidden md:inline">Dokumenter</span>
                    </Link>

                    <Link href="/polls" className="flex items-center gap-2 hover:text-blue-600 transition text-sm font-medium">
                        <Vote size={18} />
                        <span className="hidden md:inline">Afstemninger</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 hidden md:block">
                        {session.user.name || session.user.email}
                    </div>
                    {/* SignOut button would ideally be a server action or client component, 
                but for simplicity we can link to api/auth/signout or just let NextAuth handle it on the dashboard */}
                    <Link href="/api/auth/signout" className="text-gray-500 hover:text-red-600">
                        <LogOut size={18} />
                    </Link>
                </div>
            </div>
        </nav>
    )
}
