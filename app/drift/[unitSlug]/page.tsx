import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ChevronRight, ArrowLeft, Wrench, PlayCircle } from "lucide-react"

export default async function DriftUnitPage(
    props: { params: Promise<{ unitSlug: string }> }
) {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const resolvedParams = await props.params
    const unitSlug = resolvedParams.unitSlug

    const unit = await prisma.operationUnit.findUnique({
        where: { slug: unitSlug },
        include: {
            sections: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!unit) {
        return (
            <div className="container mx-auto px-4 py-12 text-center relative z-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enhed ikke fundet</h1>
                <Link href="/drift" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Tilbage til Drift
                </Link>
            </div>
        )
    }

    const quickActions = unit.sections.filter(s => s.isQuickAction)
    const normalSections = unit.sections

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/drift" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Tilbage til oversigten
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{unit.title}</h1>
                        {unit.description && (
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{unit.description}</p>
                        )}
                    </div>
                    {session.user.role === "SYSTEM_ADMIN" && (
                        <Link href="/admin/drift" className="hidden sm:flex text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors font-medium">
                            Rediger i Admin
                        </Link>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {unit.sections.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
                    <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Der er endnu ingen guides for denne enhed.</h2>
                    {session.user.role === "SYSTEM_ADMIN" && (
                        <Link href="/admin/drift" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
                            Opret første guide
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Quick Actions Array */}
                    {quickActions.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map(action => (
                                <Link
                                    key={action.id}
                                    href={`/drift/${unit.slug}/${action.slug}`}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
                                >
                                    <span className="text-lg font-bold">{action.title}</span>
                                    <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform opacity-75" />
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* All Sections List */}
                    <div>
                        {quickActions.length > 0 && (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alle vejledninger</h3>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                            {normalSections.map((section, idx) => (
                                <Link
                                    href={`/drift/${unit.slug}/${section.slug}`}
                                    key={section.id}
                                    className={`flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${idx !== normalSections.length - 1 ? "border-b border-gray-100 dark:border-gray-700/50" : ""
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{section.title}</span>
                                        {section.description && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{section.description}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {section.videoKey && (
                                            <span className="hidden sm:flex items-center text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                                                <PlayCircle className="w-3 h-3 mr-1" /> Video
                                            </span>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
