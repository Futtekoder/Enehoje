"use client"

import { useState } from "react"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Users, Anchor, CheckSquare, Info } from "lucide-react"
import { OverviewTab } from "./tabs/overview-tab"
import { ParticipationTab } from "./tabs/participation-tab"
import { SailingTab } from "./tabs/sailing-tab"
import { TasksTab } from "./tabs/tasks-tab"

interface EventDetailClientProps {
    initialEvent: any
    currentUser: any
}

export function EventDetailClient({ initialEvent, currentUser }: EventDetailClientProps) {
    const [event, setEvent] = useState(initialEvent)
    const [activeTab, setActiveTab] = useState("OVERVIEW")

    const tabs = [
        { id: "OVERVIEW", label: "Overblik", icon: Info },
        { id: "PARTICIPATION", label: "Deltagelse", icon: Users },
        { id: "SAILING", label: "Sejlads", icon: Anchor },
        { id: "TASKS", label: "Opgaver", icon: CheckSquare },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/planning" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Tilbage til Planlægning
                </Link>

                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {event.title}
                </h1>
                <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400 font-medium">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-500" />
                    {format(new Date(event.startAt), "d. MMMM", { locale: da })} - {format(new Date(event.endAt), "d. MMMM yyyy", { locale: da })}
                </div>
            </div>

            {/* Custom Tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-800 mb-8 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10 pt-2">
                <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200
                                    ${isActive
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                                `}
                            >
                                <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                {tab.label}

                                {/* Badges */}
                                {tab.id === "PARTICIPATION" && event.participations.length > 0 && (
                                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs dark:bg-gray-800 dark:text-gray-100">{event.participations.length}</span>
                                )}
                                {tab.id === "TASKS" && event.tasks.filter((t: any) => t.status === "PROPOSED").length > 0 && (
                                    <span className="ml-2 bg-orange-100 text-orange-700 py-0.5 px-2.5 rounded-full text-xs font-bold dark:bg-orange-900 dark:text-orange-200">
                                        {event.tasks.filter((t: any) => t.status === "PROPOSED").length} nye
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Tab Content Panes */}
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                {activeTab === "OVERVIEW" && <OverviewTab event={event} currentUser={currentUser} setEvent={setEvent} />}
                {activeTab === "PARTICIPATION" && <ParticipationTab event={event} currentUser={currentUser} setEvent={setEvent} />}
                {activeTab === "SAILING" && <SailingTab event={event} currentUser={currentUser} setEvent={setEvent} />}
                {activeTab === "TASKS" && <TasksTab event={event} currentUser={currentUser} setEvent={setEvent} />}
            </div>
        </div>
    )
}
