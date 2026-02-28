"use client"

import { useState } from "react"
import useSWR from "swr"
import { Calendar as CalendarIcon, List, Clock, Filter, ChevronLeft, ChevronRight, Lock, UserPlus, Info } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CalendarPage() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [view, setView] = useState<"MONTH" | "LIST">("MONTH")
    const [editingWeek, setEditingWeek] = useState<any>(null)

    const { data: session } = useSWR('/api/auth/session', fetcher)
    const isAdmin = session?.user?.role === 'SYSTEM_ADMIN' || session?.user?.role === 'ANDEL_ADMIN'

    const { data, error, isLoading, mutate } = useSWR(`/api/calendar?year=${year}`, fetcher)

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                        Enehøje Ugeplan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Officiel huskalender og andelsfordeling for {year}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-1 border-r pr-3 mr-1">
                        <button
                            onClick={() => setYear(y => y - 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-16 text-center">{year}</span>
                        <button
                            onClick={() => setYear(y => y + 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setView("MONTH")}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${view === 'MONTH' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Overblik
                        </button>
                        <button
                            onClick={() => setView("LIST")}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${view === 'LIST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            <List className="h-4 w-4" />
                            Liste
                        </button>
                    </div>
                </div>
            </div>

            {/* ICS Feed Button */}
            <div className="flex justify-end mb-6">
                <a
                    href={`/api/calendar.ics?year=${year}`}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-4 py-2 rounded-full transition-colors border border-blue-100 dark:border-blue-900/50"
                >
                    <CalendarIcon className="h-4 w-4" />
                    Abonnér i kalender (ICS)
                </a>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
                    Kunne ikke indlæse kalenderen. Prøv igen senere.
                </div>
            ) : view === "LIST" ? (
                <ListView data={data} isAdmin={isAdmin} onEditWeek={setEditingWeek} />
            ) : (
                <MonthView data={data} year={year} isAdmin={isAdmin} onEditWeek={setEditingWeek} />
            )}

            {editingWeek && (
                <WeekEditModal
                    week={editingWeek}
                    year={year}
                    onClose={() => setEditingWeek(null)}
                    onSaved={() => { setEditingWeek(null); mutate(); }}
                />
            )}
        </div>
    )
}

function ListView({ data, isAdmin, onEditWeek }: { data: any, isAdmin: boolean, onEditWeek: (w: any) => void }) {
    if (!data?.weekAssignments) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border overflow-hidden">
            <div className="divide-y dark:divide-zinc-800">
                {data.weekAssignments.map((wa: any) => (
                    <div key={wa.weekNumber} className="flex flex-col sm:flex-row p-4 gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">

                        {/* ISO Week Number Column */}
                        <div className="flex-shrink-0 w-24 flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Uge</span>
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-500">{wa.weekNumber}</span>
                        </div>

                        {/* Assignment Details */}
                        <div className="flex-grow flex flex-col justify-center">
                            <div className="flex items-center gap-3">
                                {wa.type === 'SHARE' && wa.share ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${wa.share.color || 'bg-gray-400'}`}></div>
                                        <span className="text-lg font-bold">Andel {wa.share.code || wa.share.name}</span>
                                    </div>
                                ) : wa.type === 'COMMON' ? (
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <UserPlus className="h-5 w-5" />
                                        <span className="text-lg font-bold tracking-tight">FÆLLES</span>
                                    </div>
                                ) : (
                                    <span className="text-lg font-bold text-gray-500">{wa.type}</span>
                                )}

                                {wa.isLocked && (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <Lock className="h-3 w-3" /> Kr. Himmelfart Låst
                                    </div>
                                )}
                                {wa.source === 'MANUAL' && (
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                        Manuelt Overstyret
                                    </span>
                                )}
                            </div>

                            {wa.note && (
                                <p className="text-sm text-gray-500 mt-1 flex items-start gap-1.5">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {wa.note}
                                </p>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="flex items-center">
                                <button
                                    onClick={() => onEditWeek(wa)}
                                    className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Rediger Uge
                                </button>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    )
}

function MonthView({ data, year, isAdmin, onEditWeek }: { data: any, year: number, isAdmin: boolean, onEditWeek: (w: any) => void }) {
    // For MonthView, we'll build a simpler visual grid representation mapping week numbers.
    // True month-grid rendering requires a complex localized date grid library (like date-fns or react-big-calendar).
    // Given the specifications mostly revolve around ISO weeks, an "ISO Week Ribbon/Grid" is actually more authentic.

    // Group weeks into quarters for a nicer display
    const quarters = [
        data.weekAssignments?.slice(0, 13) || [],
        data.weekAssignments?.slice(13, 26) || [],
        data.weekAssignments?.slice(26, 39) || [],
        data.weekAssignments?.slice(39) || []
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {quarters.map((quarterWeeks: any[], qIndex: number) => (
                    <div key={qIndex} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Kvartal {qIndex + 1}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {quarterWeeks.map((wa: any) => (
                                <div
                                    key={wa.weekNumber}
                                    onClick={() => isAdmin ? onEditWeek(wa) : null}
                                    className={`relative p-3 rounded-xl border flex flex-col justify-between aspect-square transition-all ${isAdmin ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-500' : ''}
                                        ${wa.type === 'COMMON' ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30' :
                                            wa.type === 'SHARE' ? 'bg-white border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-700/50' :
                                                'bg-gray-50 border-dashed dark:bg-zinc-900'}
                                    `}
                                >
                                    {/* Top: Week Number & Locks */}
                                    <div className="flex justify-between items-start">
                                        <span className="text-2xl font-black text-gray-300 dark:text-gray-600 leading-none">
                                            {wa.weekNumber}
                                        </span>
                                        {wa.isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                                    </div>

                                    {/* Bottom: Share Indicator */}
                                    <div className="mt-auto">
                                        {wa.type === 'SHARE' && wa.share ? (
                                            <div className="flex flex-col">
                                                <div className={`w-8 h-1.5 rounded-full mb-1.5 ${wa.share.color || 'bg-blue-500'}`}></div>
                                                <span className="text-sm font-bold tracking-tight">{wa.share.code || wa.share.name}</span>
                                            </div>
                                        ) : wa.type === 'COMMON' ? (
                                            <div className="flex flex-col text-indigo-600 dark:text-indigo-400">
                                                <UserPlus className="h-4 w-4 mb-1" />
                                                <span className="text-xs font-black tracking-tight leading-tight">FÆLLES</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-400">{wa.type}</span>
                                        )}
                                    </div>

                                    {wa.source === 'MANUAL' && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-zinc-900"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Event/Holiday Legend (Bottom) */}
            <div className="bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 p-6 rounded-2xl flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Vigtige Datoer & Helligdage
                    </h4>
                    <div className="text-sm space-y-2">
                        {data.holidays && data.holidays.slice(0, 5).map((h: any) => (
                            <div key={h.date} className="flex justify-between border-b border-blue-100 dark:border-blue-900/50 pb-1">
                                <span className="text-gray-600 dark:text-gray-400">{new Date(h.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}</span>
                                <span className="font-medium text-blue-900 dark:text-blue-100">{h.name}</span>
                            </div>
                        ))}
                        <button className="text-sm font-semibold text-blue-600 hover:underline mt-2">Se alle datoer...</button>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="font-bold mb-3">Farvekoder (Andele)</h4>
                    <div className="flex flex-wrap gap-2">
                        {/* We extract unique shares from the payload to build the legend dynamically */}
                        {Array.from(new Map(data.weekAssignments.filter((wa: any) => wa.type === 'SHARE' && wa.share).map((wa: any) => [wa.share.id, wa.share])).values()).map((share: any) => (
                            <div key={share.id} className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border text-xs font-bold">
                                <div className={`w-2 h-2 rounded-full ${share.color}`}></div>
                                {share.code || share.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function WeekEditModal({ week, year, onClose, onSaved }: { week: any, year: number, onClose: () => void, onSaved: () => void }) {
    const [type, setType] = useState(week.type)
    const [shareId, setShareId] = useState(week.share?.id || "")
    const [note, setNote] = useState(week.note || "")
    const [isSaving, setIsSaving] = useState(false)

    // Fetch shares for the dropdown
    const { data: shares } = useSWR('/api/shares', fetcher) // Assuming this exists or we can mock it here

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/week-assignment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, weekNumber: week.weekNumber, type, shareId: type === 'SHARE' ? shareId : null, note })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            onSaved()
        } catch (e: any) {
            alert(e.message)
        }
        setIsSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border w-full max-w-md p-6 relative">
                <h3 className="text-xl font-bold mb-1">Uge {week.weekNumber}, {year}</h3>

                {week.isLocked && (
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm mb-4 border border-amber-200">
                        Denne uge er låst (Kr. Himmelfarts ugen) og kan ikke overstyres Manuelt.
                    </div>
                )}

                <div className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 block">Tildelingstype</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={week.isLocked}
                            className="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-zinc-800"
                        >
                            <option value="SHARE">Andel</option>
                            <option value="COMMON">Fælles uge (COMMON)</option>
                            <option value="OPENING">Åbner (OPENING)</option>
                            <option value="CLOSING">Lukker (CLOSING)</option>
                            <option value="BLOCKED">Blokeret (BLOCKED)</option>
                        </select>
                    </div>

                    {type === "SHARE" && (
                        <div>
                            <label className="block text-sm font-bold mb-1 block">Vælg Andel</label>
                            <select
                                value={shareId}
                                onChange={(e) => setShareId(e.target.value)}
                                disabled={week.isLocked}
                                className="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-zinc-800"
                            >
                                <option value="">- Vælg Andel -</option>
                                {/* Maps out whatever shares were gathered in the grid data as a quick hack unless real /api/shares is built */}
                                {shares && shares.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1 block">Notat / Beskrivelse (Valgfrit)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="F.eks. Sommerferie bytte..."
                            className="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-zinc-800"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Annuller</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || week.isLocked}
                        className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                        {isSaving ? "Gemmer..." : "Gem Ændringer"}
                    </button>
                </div>
            </div>
        </div>
    )
}
