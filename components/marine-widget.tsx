"use client"

import useSWR from "swr"
import { Wind, Waves, AlertTriangle, CheckCircle2, XCircle, Info, Navigation2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function MarineWidget() {
    // Refresh every 5 minutes (300,000 ms) automatically using SWR
    const { data, error, isLoading } = useSWR('/api/marine-status', fetcher, {
        refreshInterval: 300000
    })

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg animate-pulse">
                <CardHeader className="bg-blue-50/50 dark:bg-slate-900/50">
                    <CardTitle className="flex justify-between items-center text-lg">
                        <span>Enehøje Conditions</span>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-64"></CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg border-red-200">
                <CardContent className="p-6 text-center text-red-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Conditions currently unavailable</p>
                </CardContent>
            </Card>
        )
    }

    // Helper functions for dynamic UI classes
    const getStatusColors = (status: string) => {
        switch (status) {
            case "SAFE":
                return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
            case "CAUTION":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
            case "NO_GO":
            default:
                return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        }
    }

    const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
        if (status === "SAFE") return <CheckCircle2 className={`text-green-600 dark:text-green-500 ${className}`} />
        if (status === "CAUTION") return <AlertTriangle className={`text-yellow-600 dark:text-yellow-500 ${className}`} />
        return <XCircle className={`text-red-600 dark:text-red-500 ${className}`} />
    }

    const overallStatusText = data.sailing_ok ? "SAFE TO SAIL" : (data.wind_status === "CAUTION" && data.depth_ok) ? "CAUTION" : "DO NOT SAIL"
    const overallStatusColor = data.sailing_ok ? "SAFE" : (data.wind_status === "CAUTION" && data.depth_ok) ? "CAUTION" : "NO_GO"

    return (
        <Card className="w-full mx-auto shadow-2xl border-white/20 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl">
            {/* Header / Big Indicator - Compact */}
            <div className={`p-3 border-b flex items-center justify-between transition-colors ${getStatusColors(overallStatusColor)}`}>
                <div className="flex items-center gap-2">
                    <StatusIcon status={overallStatusColor} className="h-6 w-6" />
                    <h2 className="text-xl font-black tracking-tight">{overallStatusText}</h2>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">
                    Sejlbarhed Enehøje
                </h3>
            </div>

            <CardContent className="p-4">
                {/* Current Stats Row - Super Compact Side by Side */}
                <div className="grid grid-cols-2 gap-3 mb-4">

                    {/* WIND */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/50">
                        <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColors(data.wind_status)}`}>
                            <Wind className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aktuel Vind</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black leading-none">{data.wind_now_ms.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 font-medium">m/s</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 font-medium">
                                <Navigation2 className="h-3 w-3" style={{ transform: `rotate(${data.wind_direction}deg)` }} />
                                <span>{data.wind_direction}°</span>
                            </div>
                        </div>
                    </div>

                    {/* DEPTH */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/50">
                        <div className={`p-2 rounded-full flex-shrink-0 ${data.depth_ok ? getStatusColors("SAFE") : getStatusColors("NO_GO")}`}>
                            <Waves className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col w-full">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Vanddybde</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black leading-none">{data.calculated_depth_m.toFixed(2)}</span>
                                <span className="text-xs text-gray-500 font-medium">m</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                                Lavvande: {new Date(data.next_low_tide.time).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7-Day Forecast - Compact Horizontal Scroll/Grid */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Info className="h-3 w-3" /> Maks vind udsigt
                    </h4>

                    <div className="grid grid-cols-7 gap-1.5">
                        {data.forecast.map((day: any) => {
                            const dateObj = new Date(day.date)
                            const dayName = dateObj.toLocaleDateString('da-DK', { weekday: 'short' }).replace('.', '')

                            return (
                                <div key={day.date} className={`flex flex-col items-center justify-center py-2 px-1 rounded-md border ${getStatusColors(day.wind_status)}`}>
                                    <span className="text-[9px] font-bold uppercase mb-0.5 opacity-80">{dayName}</span>
                                    <span className="font-extrabold text-xs leading-none">{Math.round(day.max_wind_ms)}</span>
                                    {/* <StatusIcon status={day.wind_status} className="h-3 w-3 mt-1 opacity-80" /> */}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-3 text-right text-[9px] text-gray-400 font-medium">
                    Opdateret: {new Date(data.last_updated).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </CardContent>
        </Card>
    )
}
