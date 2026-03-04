import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SectionClient } from "./section-client"

export default async function DriftSectionPage(
    props: { params: Promise<{ unitSlug: string, sectionSlug: string }> }
) {
    const session = await auth()
    if (!session?.user) {
        redirect("/")
    }

    const resolvedParams = await props.params
    const { unitSlug, sectionSlug } = resolvedParams

    const section = await prisma.operationSection.findUnique({
        where: { unitId_slug: { unitId: '', slug: sectionSlug } } // Need to find carefully since we need the unit's ID
    })

    // Better query: FIND the unit first, then the section, or do deeply nested
    const unit = await prisma.operationUnit.findUnique({
        where: { slug: unitSlug },
        include: {
            sections: {
                where: { slug: sectionSlug },
                include: {
                    checklist: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    })

    if (!unit || unit.sections.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center relative z-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vejledning ikke fundet</h1>
                <Link href={`/drift/${unitSlug}`} className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Tilbage til enheden
                </Link>
            </div>
        )
    }

    const currentSection = unit.sections[0]

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 relative z-10">
            <Link href={`/drift/${unit.slug}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Tilbage til {unit.title}
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{currentSection.title}</h1>
                {currentSection.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{currentSection.description}</p>
                )}
            </div>

            <SectionClient section={currentSection} region={process.env.AWS_REGION} />
        </div>
    )
}
