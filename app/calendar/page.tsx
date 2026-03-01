"use client"

import { useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns"
import { da } from "date-fns/locale"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink } from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CalendarMonthPage() {
    const [currentDate, setCurrentDate] = useState(new Date())

    const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

    // Fetch calendar data for the currently viewed year
    const year = currentDate.getFullYear()
    const { data: calData, isLoading } = useSWR(`/api/calendar?year=${year}`, fetcher, {
        refreshInterval: 60000 // Auto refresh every 60s
    })

    // Grid Math
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    // Helper: Map share code to color string (matches your scheme)
    const getShareColor = (code: string | null) => {
        switch (code) {
            case 'FK': return 'bg-red-500'
            case 'HT': return 'bg-blue-500'
            case 'OT': return 'bg-green-500'
            case 'KP': return 'bg-yellow-500'
            case 'AF': return 'bg-[rgb(168,85,247)]' // purple-500
            default: return 'bg-gray-400'
        }
    }

    // Process the days and group by week row
    while (day <= endDate) {
        // Evaluate the week details based on Monday
        const isoWeek = format(day, 'I') // Standard ISO Week string
        const weekAssignment = calData?.weekAssignments?.find((w: any) => w.weekNumber === parseInt(isoWeek))
        const ownerCode = weekAssignment?.share?.code || null
        const isCommonWeek = weekAssignment?.type === 'HOLIDAY' || ownerCode === 'FÆLLES' || weekAssignment?.isLocked

        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat)
            const isoDateString = format(day, 'yyyy-MM-dd')
            const cloneDay = day

            // Highlight checks
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, monthStart)

            // See if there's a holiday for this day
            const holiday = calData?.holidays?.find((h: any) => h.date === isoDateString)

            days.push(
                <div
                    key={day.toString()}
                    className={`min-h-[80px] md:min-h-[96px] p-2 border-r border-b relative flex flex-col ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-zinc-800/20 text-gray-400' : 'bg-white dark:bg-zinc-900'
                        } ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                            {formattedDate}
                        </span>
                    </div>

                    {/* Render Holiday Pill if one exists */}
                    {holiday && (
                        <div className="mt-1 bg-[#00897B] text-white text-[10px] leading-tight font-semibold px-1.5 py-0.5 rounded-sm line-clamp-2" title={holiday.name}>
                            {holiday.name}
                        </div>
                    )}
                </div>
            )
            day = addDays(day, 1)
        }

        // Push the completed week row
        rows.push(
            <div className="flex w-full min-w-max md:min-w-0" key={day.toString()}>
                {/* Dynamic Week Badge */}
                <div className="w-16 border-r border-b bg-gray-50 dark:bg-zinc-800 p-2 flex flex-col items-center justify-center border-l gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Uge {isoWeek}</span>
                    {isLoading ? (
                        <span className="text-xs text-gray-300">...</span>
                    ) : (
                        <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full 
                        ${isCommonWeek ? 'bg-gray-800 dark:bg-black text-[9px]' : getShareColor(ownerCode)}`}>
                            {isCommonWeek ? 'FÆLLES' : ownerCode || '--'}
                        </span>
                    )}
                </div>
                {/* 7 Days of the Week */}
                <div className="grid grid-cols-7 flex-grow">
                    {days}
                </div>
            </div>
        )
        days = [] // clear days array for the next week
    }

    // Find today's active share
    const currentIsoWeek = format(new Date(), 'I')
    const activeWeekAssignment = calData?.weekAssignments?.find((w: any) => w.weekNumber === parseInt(currentIsoWeek))
    const activeOwner = activeWeekAssignment?.share?.code || null
    const isActiveCommon = activeWeekAssignment?.type === 'HOLIDAY' || activeOwner === 'FÆLLES' || activeWeekAssignment?.isLocked

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">

            {/* Header / Current Week Highlight */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-blue-600" /> Enehøje Kalender
                    </h1>
                    <p className="text-gray-500 mt-1">Officiel kalender for øen.</p>
                </div>

                {/* Dynamisk "Denne Uge" Highlight */}
                {calData && (
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 px-6 py-3 rounded-xl border border-gray-100 dark:border-zinc-700">
                        <div className="text-sm">
                            <span className="text-gray-500 font-medium block mb-1">Denne uge (Uge {currentIsoWeek}):</span>
                            <span className={`px-3 py-1 font-bold text-white rounded-full text-sm shadow-sm
                                ${isActiveCommon ? 'bg-gray-800 dark:bg-black' : getShareColor(activeOwner)}`}>
                                {isActiveCommon ? 'FÆLLES' : activeOwner || '--'}
                            </span>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <Link href="/ugeplan" className="text-sm border border-gray-200 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        Se ugeplan og byt <ExternalLink className="h-4 w-4" />
                    </Link>
                    <a href="/api/calendar.ics" className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-blue-100 dark:border-blue-900/50">
                        <CalendarIcon className="h-4 w-4" /> Abonnér i kalender (ICS)
                    </a>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-2">
                <button onClick={handleToday} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                    I dag
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={handlePreviousMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold w-48 text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: da })}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
                <div className="w-[52px]"></div> {/* spacer */}
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Day Headers */}
                        <div className="flex w-full bg-gray-50 dark:bg-zinc-800/50 border-b">
                            <div className="w-16 border-r p-2 border-l"></div>
                            <div className="grid grid-cols-7 flex-grow">
                                {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
                                    <div key={day} className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Days Grid */}
                        <div className="flex flex-col">
                            {rows}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
