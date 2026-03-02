"use client"

import { useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns"
import { da } from "date-fns/locale"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink, List, Clock, Lock, UserPlus, Info, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function UnifiedCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [year, setYear] = useState(currentDate.getFullYear())
    const [view, setView] = useState<"MONTH" | "LIST">("MONTH")
    const [editingWeek, setEditingWeek] = useState<any>(null)

    const { data: session } = useSWR('/api/auth/session', fetcher)
    const isAdmin = session?.user?.role === 'SYSTEM_ADMIN' || session?.user?.role === 'ANDEL_ADMIN'

    const handlePreviousMonth = () => {
        const newDate = subMonths(currentDate, 1)
        setCurrentDate(newDate)
        setYear(newDate.getFullYear())
    }
    const handleNextMonth = () => {
        const newDate = addMonths(currentDate, 1)
        setCurrentDate(newDate)
        setYear(newDate.getFullYear())
    }
    const handleToday = () => {
        const today = new Date()
        setCurrentDate(today)
        setYear(today.getFullYear())
    }

    // Unified fetch for both layout components
    const { data: calData, isLoading, mutate } = useSWR(`/api/calendar?year=${year}`, fetcher, {
        refreshInterval: 60000
    })

    // ===== MONTHLY CALENDAR MATH =====
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate

    const getShareColor = (code: string | null) => {
        switch (code) {
            case 'FK': return 'bg-red-500'
            case 'HT': return 'bg-blue-500'
            case 'OT': return 'bg-green-500'
            case 'KP': return 'bg-yellow-500'
            case 'AF': return 'bg-[rgb(168,85,247)]'
            default: return 'bg-gray-400'
        }
    }

    while (day <= endDate) {
        const isoWeek = format(day, 'I')
        const weekAssignment = calData?.weekAssignments?.find((w: any) => w.weekNumber === parseInt(isoWeek))
        const ownerCode = weekAssignment?.share?.code || null
        const isCommonWeek = weekAssignment?.type === 'HOLIDAY' || ownerCode === 'FÆLLES' || weekAssignment?.isLocked

        for (let i = 0; i < 7; i++) {
            const formattedDate = format(day, dateFormat)
            const isoDateString = format(day, 'yyyy-MM-dd')
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, monthStart)
            const holiday = calData?.holidays?.find((h: any) => h.date === isoDateString)

            days.push(
                <div
                    key={day.toString()}
                    className={`min-h-[60px] p-1 border-r border-b relative flex flex-col ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-zinc-800/20 text-gray-400' : 'bg-white dark:bg-zinc-900'} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-semibold flex items-center justify-center w-5 h-5 rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                            {formattedDate}
                        </span>
                    </div>
                    {holiday && (
                        <div className="mt-0.5 bg-[#00897B] text-white text-[8px] leading-tight font-semibold px-1 py-0.5 rounded-sm line-clamp-1" title={holiday.name}>
                            {holiday.name}
                        </div>
                    )}
                </div>
            )
            day = addDays(day, 1)
        }

        rows.push(
            <div className="flex w-full" key={day.toString()}>
                <div className="w-12 border-r border-b bg-gray-50 dark:bg-zinc-800 p-1 flex flex-col items-center justify-center border-l gap-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Uge {isoWeek}</span>
                    {isLoading ? (
                        <span className="text-[10px] text-gray-300">...</span>
                    ) : (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full ${isCommonWeek ? 'bg-gray-800 dark:bg-black text-[8px]' : getShareColor(ownerCode)}`}>
                            {isCommonWeek ? 'FÆLLES' : ownerCode || '--'}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-7 flex-grow">
                    {days}
                </div>
            </div>
        )
        days = []
    }

    const currentIsoWeek = format(new Date(), 'I')
    const activeWeekAssignment = calData?.weekAssignments?.find((w: any) => w.weekNumber === parseInt(currentIsoWeek))
    const activeOwner = activeWeekAssignment?.share?.code || null
    const isActiveCommon = activeWeekAssignment?.type === 'HOLIDAY' || activeOwner === 'FÆLLES' || activeWeekAssignment?.isLocked

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl relative min-h-[80vh]">

            {/* Sassy Background Flares */}
            <div className="fixed -top-32 -right-32 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            <div className="fixed -bottom-48 -left-32 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

            <div className="space-y-8 relative z-10">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-800/60 p-6 rounded-3xl shadow-xl">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                Enehøje Kalender
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Officiel huskalender og andelsfordeling for {year}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 dark:border-zinc-700/50">
                            <button
                                onClick={() => { setYear(y => y - 1); setCurrentDate(subMonths(currentDate, 12)) }}
                                className="p-2hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="font-black w-16 text-center text-lg">{year}</span>
                            <button
                                onClick={() => { setYear(y => y + 1); setCurrentDate(addMonths(currentDate, 12)) }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Link
                        href="/dashboard/swap"
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-white dark:text-gray-900 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xl"
                    >
                        <div className="absolute inset-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 blur-md -z-10"></div>
                        <ArrowRightLeft className="h-5 w-5" />
                        Opret Bytteønske
                    </Link>

                    <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 dark:border-zinc-800/60 shadow-sm">
                        <button
                            onClick={() => setView("MONTH")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'MONTH' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-500 dark:text-gray-400'}`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Overblik
                        </button>
                        <button
                            onClick={() => setView("LIST")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'LIST' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-500 dark:text-gray-400'}`}
                        >
                            <List className="h-4 w-4" />
                            Liste
                        </button>
                    </div>
                </div>

                {/* Main Content Areas */}
                {isLoading ? (
                    <div className="h-96 flex items-center justify-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                    </div>
                ) : view === "LIST" ? (
                    <ListView data={calData} isAdmin={isAdmin} onEditWeek={setEditingWeek} />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-12">

                        {/* ==================================
                            LEFT SIDE: Compact Monthly View (Top on mobile, left on desktop)
                        =================================== */}
                        <div className="w-full lg:w-1/3 xl:w-[400px] shrink-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-zinc-800/60 overflow-hidden lg:sticky lg:top-8">

                            <div className="p-4 border-b border-white/20 dark:border-zinc-800/50 bg-white/40 dark:bg-black/10 flex justify-between items-center backdrop-blur-sm">
                                <button onClick={handleToday} className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                    I dag
                                </button>
                                <div className="flex gap-1 items-center bg-white/50 dark:bg-zinc-800/50 rounded-lg p-0.5 shadow-sm">
                                    <button onClick={handlePreviousMonth} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                                    <span className="font-black text-sm min-w-[100px] text-center capitalize">{format(currentDate, 'MMMM', { locale: da })}</span>
                                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                </div>
                            </div>

                            <div className="flex w-full bg-black/5 dark:bg-black/20 border-b border-white/20 dark:border-zinc-800/50">
                                <div className="w-12 border-r border-white/20 dark:border-zinc-800/50 p-1"></div>
                                <div className="grid grid-cols-7 flex-grow">
                                    {['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'].map(d => (
                                        <div key={d} className="text-center py-2 text-[10px] font-black text-gray-400 border-r border-white/20 dark:border-zinc-800/50 last:border-0">{d}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col bg-white/20 dark:bg-black/10">
                                {rows}
                            </div>
                        </div>


                        {/* ==================================
                            RIGHT SIDE: Primary Year Grid 
                        =================================== */}
                        <div className="flex-1 w-full min-w-0">
                            <YearGridView data={calData} year={year} isAdmin={isAdmin} onEditWeek={setEditingWeek} />
                        </div>
                    </div>
                )}
            </div>

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
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-zinc-800/60 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                {data.weekAssignments.map((wa: any) => (
                    <div key={wa.weekNumber} className="flex flex-col sm:flex-row p-6 gap-6 hover:bg-white/90 dark:hover:bg-zinc-800/80 transition-all group">
                        <div className="flex-shrink-0 w-24 flex flex-col justify-center items-center bg-gray-50/50 dark:bg-black/20 rounded-2xl p-4 border border-white/50 dark:border-zinc-800/50">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Uge</span>
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">{wa.weekNumber}</span>
                        </div>
                        <div className="flex-grow flex flex-col justify-center">
                            <div className="flex items-center gap-3">
                                {wa.type === 'SHARE' && wa.share ? (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full shadow-inner ${wa.share.color || 'bg-gray-400'}`}></div>
                                        <span className="text-xl font-black tracking-tight drop-shadow-sm">Andel {wa.share.code || wa.share.name}</span>
                                    </div>
                                ) : wa.type === 'COMMON' ? (
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                                        <UserPlus className="h-5 w-5" />
                                        <span className="text-lg font-black tracking-tight">FÆLLES</span>
                                    </div>
                                ) : (
                                    <span className="text-lg font-bold text-gray-400">{wa.type}</span>
                                )}

                                {wa.isLocked && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50/80 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm shadow-sm">
                                        <Lock className="h-3 w-3" /> Kr. Himmelfart Låst
                                    </div>
                                )}
                                {wa.source === 'MANUAL' && (
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50/80 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm shadow-sm">
                                        Manuelt Overstyret
                                    </span>
                                )}
                            </div>

                            {wa.note && (
                                <p className="text-sm text-gray-500 font-medium mt-3 flex items-start gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/40 dark:border-zinc-800/50">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                    {wa.note}
                                </p>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="flex items-center">
                                <button
                                    onClick={() => onEditWeek(wa)}
                                    className="text-sm font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2.5 rounded-xl transition-all shadow-sm border border-blue-100/50 dark:border-blue-800/30"
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

function YearGridView({ data, year, isAdmin, onEditWeek }: { data: any, year: number, isAdmin: boolean, onEditWeek: (w: any) => void }) {
    const weeks = data?.weekAssignments || []

    return (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-zinc-800/60">
            {/* Narrower grid config for side-by-side mode */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                {weeks.map((wa: any) => (
                    <div
                        key={wa.weekNumber}
                        onClick={() => isAdmin ? onEditWeek(wa) : null}
                        className={`relative p-3 rounded-2xl border shadow-sm flex flex-col justify-between aspect-square transition-all ${isAdmin ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-blue-500/50' : ''}
                            ${wa.type === 'COMMON' ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-100/50 dark:from-indigo-900/30 dark:to-purple-900/20 dark:border-indigo-800/30' :
                                wa.type === 'SHARE' ? 'bg-white/90 border-gray-100/80 dark:bg-zinc-800/90 dark:border-zinc-700/50' :
                                    'bg-gray-50/50 border-dashed dark:bg-zinc-900/50'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-2xl font-black text-gray-300 dark:text-gray-600 leading-none drop-shadow-sm">
                                {wa.weekNumber}
                            </span>
                            {wa.isLocked && <Lock className="h-3.5 w-3.5 text-amber-500 drop-shadow-sm" />}
                        </div>

                        <div className="mt-auto">
                            {wa.type === 'SHARE' && wa.share ? (
                                <div className="flex flex-col">
                                    <div className={`w-full h-2 rounded-full mb-1.5 shadow-inner ${wa.share.color || 'bg-blue-500'}`}></div>
                                    <span className="text-xs font-black tracking-tight">{wa.share.code || wa.share.name}</span>
                                </div>
                            ) : wa.type === 'COMMON' ? (
                                <div className="flex flex-col text-indigo-700 dark:text-indigo-300">
                                    <span className="text-[10px] font-black tracking-widest bg-indigo-100/80 dark:bg-indigo-900/50 px-1 py-1 rounded-md text-center shadow-sm">FÆLLES</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{wa.type}</span>
                            )}
                        </div>

                        {wa.source === 'MANUAL' && (
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-md ring-2 ring-white dark:ring-zinc-900"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function WeekEditModal({ week, year, onClose, onSaved }: { week: any, year: number, onClose: () => void, onSaved: () => void }) {
    const [type, setType] = useState(week.type)
    const [shareId, setShareId] = useState(week.share?.id || "")
    const [note, setNote] = useState(week.note || "")
    const [isSaving, setIsSaving] = useState(false)

    const { data: shares } = useSWR('/api/shares', fetcher)

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
                        <label className="block text-sm font-bold mb-1">Tildelingstype</label>
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
                            <label className="block text-sm font-bold mb-1">Vælg Andel</label>
                            <select
                                value={shareId}
                                onChange={(e) => setShareId(e.target.value)}
                                disabled={week.isLocked}
                                className="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-zinc-800"
                            >
                                <option value="">- Vælg Andel -</option>
                                {shares && shares.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1">Notat / Beskrivelse (Valgfrit)</label>
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

