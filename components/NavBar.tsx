"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Calendar as CalendarIcon, MessageSquare, FileText, Vote, LogOut, Menu, X, Plane, Anchor, Wrench, ChevronDown, Settings, Image as ImageIcon } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function NavBar() {
    const { data: session } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const pathname = usePathname()

    if (!session?.user) return null

    const navLinks = [
        { name: "Kalender", href: "/calendar", icon: <CalendarIcon size={18} /> },
        { name: "Planlægning", href: "/planning", icon: <Plane size={18} /> },
        { name: "Drift & Sikkerhed", href: "/operations", icon: <Wrench size={18} /> },
        { name: "Forum", href: "/forum", icon: <MessageSquare size={18} /> },
    ]

    const moreLinks = [
        { name: "Dokumenter", href: "/documents", icon: <FileText size={16} /> },
        { name: "Afstemninger", href: "/polls", icon: <Vote size={16} /> },
        { name: "Galleri", href: "/gallery", icon: <ImageIcon size={16} /> },
    ]

    if (session.user.role === 'SYSTEM_ADMIN' || session.user.role === 'ANDEL_ADMIN') {
        moreLinks.push({ name: "Admin Panel", href: "/admin", icon: <Settings size={16} /> })
    }

    return (
        <nav className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="font-bold text-xl flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl drop-shadow-sm">🏝️</span>
                    <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-blue-200">
                        Enehøje
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1 md:gap-2">
                    {navLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 hover:text-blue-600'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        )
                    })}

                    {/* "Mere" Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            onBlur={() => setTimeout(() => setIsMoreMenuOpen(false), 200)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-sm font-bold
                                ${isMoreMenuOpen
                                    ? 'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 hover:text-blue-600'
                                }`}
                        >
                            <span>Mere</span>
                            <ChevronDown size={14} className={`transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                {moreLinks.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-blue-600 transition-colors"
                                    >
                                        <span className="text-gray-400">{link.icon}</span>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Actions & Mobile Toggle */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700/50 hidden sm:flex">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {session.user.name?.split(' ')[0] || "Bruger"}
                        </span>
                    </div>

                    <Link href="/signout" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Log ud">
                        <LogOut size={20} />
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-4">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base font-bold
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            )
                        })}

                        <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2 mx-4"></div>
                        <div className="px-4 py-2 text-xs font-black tracking-widest text-gray-400 uppercase">Mere</div>

                        {moreLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <span className="text-gray-400">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
