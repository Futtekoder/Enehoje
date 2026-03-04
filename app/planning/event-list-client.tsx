"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import Link from "next/link"
import { CalendarDays, Users, CheckSquare, Ship, MapPin, Plus } from "lucide-react"
import { CreateEventModal } from "./create-event-modal"

export function EventListClient({ userRole, userShares }: { userRole: string, userShares: any[] }) {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("UPCOMING") // UPCOMING, MINE, WORK, SHARE
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchEvents()
    }, [filter])

    async function fetchEvents() {
        setLoading(true)
        try {
            let url = "/api/events"
            if (filter === "MINE") url += "?mine=true"
            else if (filter === "SHARE") url += "?scope=SHARE"
            // else if (filter === "WORK") ... wait we can filter client side if we fetch everything,
            // but the backend only has ?scope and ?mine. Let's just fetch all and filter client side

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error("Failed to fetch events", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredEvents = events.filter(e => {
        if (filter === "WORK") return e.type === "WORK_WEEKEND"
        return true
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'WORK_WEEKEND': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            case 'COMMON_WEEKEND': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'SHARE_STAY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'WORK_WEEKEND': return 'Arbejdsweekend'
            case 'COMMON_WEEKEND': return 'Fællesweekend'
            case 'SHARE_STAY': return 'Andels-ophold'
            default: return 'Andet'
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Filter Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-none w-full sm:w-auto">
                    <button
                        onClick={() => setFilter("UPCOMING")}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "UPCOMING" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"}`}
                    >
                        Alle Kommende
                    </button>
                    <button
                        onClick={() => setFilter("MINE")}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "MINE" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"}`}
                    >
                        Mine Tilmeldinger
                    </button>
                    <button
                        onClick={() => setFilter("WORK")}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "WORK" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"}`}
                    >
                        Arbejdsweekender
                    </button>
                    <button
                        onClick={() => setFilter("SHARE")}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "SHARE" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"}`}
                    >
                        Mine Andele
                    </button>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all sm:ml-auto w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Opret Arrangement
                </button>
            </div>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                userRole={userRole}
                userShares={userShares}
                onEventCreated={(newEvent) => {
                    setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()))
                }}
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl h-64 shadow-sm border border-gray-100 dark:border-gray-700"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ingen arrangementer fundet</h3>
                    <p className="text-gray-500 mt-1">Prøv at ændre dine filtre for at se flere.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <Link href={`/planning/${event.id}`} key={event.id} className="group">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-900 flex flex-col h-full ring-1 ring-black/5 dark:ring-white/10">

                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(event.type)}`}>
                                            {getTypeLabel(event.type)}
                                        </span>
                                        {event.scope === "SHARE" && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                Andel-Specifik
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                                        <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                                        {format(new Date(event.startAt), "d. MMM", { locale: da })} - {format(new Date(event.endAt), "d. MMM yyyy", { locale: da })}
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 divide-x divide-gray-200 dark:divide-gray-700">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Users className="w-4 h-4 text-gray-400 mb-1" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{event.participations?.length || 0}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Deltagere</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <CheckSquare className="w-4 h-4 text-emerald-500 mb-1" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{event.tasks?.length || 0}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Opgaver</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Ship className="w-4 h-4 text-blue-400 mb-1" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{event.sailingWishes?.length || 0}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Bådønsker</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
