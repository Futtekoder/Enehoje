import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Home, Lightbulb, Anchor, Wrench, Flame, HelpCircle } from "lucide-react"

// A mapping of icon strings to Lucide components for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
    Home,
    Lightbulb,
    Anchor,
    Wrench,
    Flame,
    HelpCircle
}

export default async function DriftLandingPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const units = await prisma.operationUnit.findMany({
        orderBy: { order: 'asc' },
        include: {
            sections: true
        }
    })

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 mb-3">
                    Drift & Vejledninger
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    Her finder du tjeklister, instruktionsvideoer og procedurer for gårdens og øens maskineri.
                    Vælg en enhed for at se procedurerne.
                </p>
            </div>

            {units.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
                    <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ingen vejledninger endnu</h2>
                    <p className="text-gray-500">Systemadministratoren har endnu ikke oprettet nogen enheder i systemet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.map(unit => {
                        const IconComponent = unit.icon && ICON_MAP[unit.icon] ? ICON_MAP[unit.icon] : HelpCircle

                        return (
                            <Link
                                href={`/drift/${unit.slug}`}
                                key={unit.id}
                                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />

                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 relative z-10 group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-8 h-8" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
                                    {unit.title}
                                </h2>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 relative z-10 line-clamp-2">
                                    {unit.description || "Ingen beskrivelse tilføjet."}
                                </p>

                                <div className="mt-auto flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 relative z-10">
                                    <span className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                        {unit.sections.length} guides
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
