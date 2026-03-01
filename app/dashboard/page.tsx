
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Calendar, MessageSquare, FileText, Vote, LogOut, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            share: {
                select: {
                    id: true,
                    name: true,
                    // voteWeight excluded
                }
            }
        },
    })

    const features = [
        {
            title: "Kalender & Bytte",
            description: "Se årsoversigt, hvem der har huset hvornår, og anmod om bytte.",
            icon: <Calendar className="w-8 h-8 text-blue-600" />,
            href: "/calendar",
            color: "bg-blue-50 dark:bg-blue-900/20",
            hoverColor: "group-hover:ring-blue-500"
        },
        {
            title: "Debat Forum",
            description: "Diskutér med de andre andelshavere, del billeder og idéer.",
            icon: <MessageSquare className="w-8 h-8 text-green-600" />,
            href: "/forum",
            color: "bg-green-50 dark:bg-green-900/20",
            hoverColor: "group-hover:ring-green-500"
        },
        {
            title: "Dokumentarkiv",
            description: "Find vedtægter, referater og husorden samlet ét sted.",
            icon: <FileText className="w-8 h-8 text-purple-600" />,
            href: "/documents",
            color: "bg-purple-50 dark:bg-purple-900/20",
            hoverColor: "group-hover:ring-purple-500"
        },
        {
            title: "Afstemninger",
            description: "Deltag i beslutninger og se resultater af tidligere afstemninger.",
            icon: <Vote className="w-8 h-8 text-orange-600" />,
            href: "/polls",
            color: "bg-orange-50 dark:bg-orange-900/20",
            hoverColor: "group-hover:ring-orange-500"
        }
    ]

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-5xl">
            {/* Header */}
            <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Velkommen til Ø-Foreningen, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Du er logget ind som <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.share?.name || "Gæst"}</span>
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature) => (
                    <Link
                        key={feature.title}
                        href={feature.href}
                        className={`group relative p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${feature.hoverColor} hover:ring-2 hover:ring-offset-2 dark:hover:ring-offset-black`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-xl ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions / Footer-ish */}
            {user?.role === 'SYSTEM_ADMIN' && (
                <div className="mt-12 flex justify-center">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-full hover:bg-black transition-colors text-sm font-medium"
                    >
                        🔐 Gå til Admin Panel
                    </Link>
                </div>
            )}
        </div>
    )
}
