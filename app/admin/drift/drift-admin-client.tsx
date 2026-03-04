"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Video, ListChecks, GripVertical } from "lucide-react"

export function DriftAdminClient({ initialUnits }: { initialUnits: any[] }) {
    const [units, setUnits] = useState(initialUnits)
    const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null)

    // A simple refresh function
    const refreshData = async () => {
        const res = await fetch("/api/admin/drift/units")
        if (res.ok) setUnits(await res.json())
    }

    const handleCreateUnit = async () => {
        const title = prompt("Navn på enhed (f.eks. Villaen):")
        if (!title) return
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

        const res = await fetch("/api/admin/drift/units", {
            method: "POST",
            body: JSON.stringify({ title, slug, description: "", icon: "Home", order: units.length })
        })
        if (res.ok) refreshData()
        else alert("Fejl ved oprettelse")
    }

    const handleDeleteUnit = async (id: string) => {
        if (!confirm("Slet denne enhed og alle dens under-sektioner permanent?")) return
        const res = await fetch(`/api/admin/drift/units/${id}`, { method: "DELETE" })
        if (res.ok) refreshData()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={handleCreateUnit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Tilføj Enhed
                </button>
            </div>

            {units.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    Der er ingen enheder endnu. Opret den første (fx "Båden" eller "Villaen").
                </div>
            )}

            <div className="space-y-3">
                {units.map((unit) => (
                    <div key={unit.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => setExpandedUnitId(expandedUnitId === unit.id ? null : unit.id)}
                        >
                            <div className="flex items-center gap-3">
                                {expandedUnitId === unit.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{unit.title}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">/{unit.slug} • {unit.sections.length} sektioner</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id) }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {expandedUnitId === unit.id && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <SectionsManager unitId={unit.id} sections={unit.sections} onRefresh={refreshData} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function SectionsManager({ unitId, sections, onRefresh }: { unitId: string, sections: any[], onRefresh: () => void }) {
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

    const handleCreateSection = async () => {
        const title = prompt("Navn på sektion (f.eks. Åbning af huset):")
        if (!title) return
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

        const res = await fetch(`/api/admin/drift/sections`, {
            method: "POST",
            body: JSON.stringify({ unitId, title, slug, description: "", order: sections.length })
        })
        if (res.ok) onRefresh()
        else alert("Fejl ved oprettelse")
    }

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Slet denne sektion?")) return
        const res = await fetch(`/api/admin/drift/sections/${id}`, { method: "DELETE" })
        if (res.ok) onRefresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sektioner</h4>
                <button onClick={handleCreateSection} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    <Plus className="w-4 h-4 mr-1" /> Opret sektion
                </button>
            </div>

            {sections.length === 0 && (
                <p className="text-sm text-gray-500 py-2">Ingen sektioner oprettet endnu.</p>
            )}

            <div className="space-y-2">
                {sections.map(sec => (
                    <div key={sec.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            onClick={() => setExpandedSectionId(expandedSectionId === sec.id ? null : sec.id)}
                        >
                            <div className="flex items-center gap-3">
                                {expandedSectionId === sec.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{sec.title}</span>
                                    {sec.isQuickAction && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Quick Action</span>}
                                    {sec.videoKey && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><Video className="w-3 h-3 mr-1" />Video</span>}
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id) }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {expandedSectionId === sec.id && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-6">
                                {/* Toggle Quick Action */}
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Vis som knap i toppen af siden?</p>
                                        <p className="text-xs text-gray-500">Gør sektionen til et "Quick Action" for at fremhæve den.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const res = await fetch(`/api/admin/drift/sections/${sec.id}`, {
                                                method: "PATCH", body: JSON.stringify({ isQuickAction: !sec.isQuickAction })
                                            })
                                            if (res.ok) onRefresh()
                                        }}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${sec.isQuickAction ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sec.isQuickAction ? 'translate-x-2' : '-translate-x-2'}`} />
                                    </button>
                                </div>

                                <VideoUploader section={sec} onRefresh={onRefresh} />
                                <ChecklistManager sectionId={sec.id} checklist={sec.checklist} onRefresh={onRefresh} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function VideoUploader({ section, onRefresh }: { section: any, onRefresh: () => void }) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("video/")) {
            alert("Kun videofiler er tilladt")
            return
        }

        setUploading(true)
        try {
            // 1. Get presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            })
            if (!res.ok) throw new Error("Kunne ikke få signeret URL")
            const { signedUrl, key } = await res.json()

            // 2. Upload direct to AWS S3
            await fetch(signedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            })

            // 3. Save key to DB
            await fetch(`/api/admin/drift/sections/${section.id}`, {
                method: "PATCH",
                body: JSON.stringify({ videoKey: key, videoSize: file.size })
            })

            onRefresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteVideo = async () => {
        if (!confirm("Fjern video fra denne sektion? (Videoen vil blive liggende i S3 historisk)")) return
        await fetch(`/api/admin/drift/sections/${section.id}`, {
            method: "PATCH",
            body: JSON.stringify({ videoKey: null, videoSize: null })
        })
        onRefresh()
    }

    return (
        <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Video className="w-3 h-3 mr-1" /> Instrukts-video</h5>
            {section.videoKey ? (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate max-w-[200px]">{section.videoKey.split('/').pop()}</span>
                    <button onClick={handleDeleteVideo} className="text-red-500 hover:text-red-700 text-xs font-semibold">Fjern Video</button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{uploading ? "Uploader til S3..." : "Klik for at uploade video (MP4/MOV)"}</p>
                    </div>
                    <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
            )}
        </div>
    )
}

function ChecklistManager({ sectionId, checklist, onRefresh }: { sectionId: string, checklist: any[], onRefresh: () => void }) {
    const handleAddItem = async () => {
        const text = prompt("Nyt checkliste-punkt:")
        if (!text) return
        await fetch(`/api/admin/drift/checklists`, {
            method: "POST", body: JSON.stringify({ sectionId, text, order: checklist.length })
        })
        onRefresh()
    }

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/drift/checklists/${id}`, { method: "DELETE" })
        onRefresh()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center"><ListChecks className="w-3 h-3 mr-1" /> Checklist</h5>
                <button onClick={handleAddItem} className="text-xs text-blue-600 font-semibold">+ Tilføj Punkt</button>
            </div>

            <div className="space-y-1">
                {checklist.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}.</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
                        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {checklist.length === 0 && (
                    <p className="text-xs text-gray-500 italic pb-2">Ingen punkter (opretter du ingen checkliste, skjules modulet på siden).</p>
                )}
            </div>
        </div>
    )
}
