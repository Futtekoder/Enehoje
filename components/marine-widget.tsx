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
        <Card className="w-full max-w-3xl mx-auto shadow-xl border-blue-100 dark:border-zinc-800 overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            {/* Header / Big Indicator */}
            <div className={`p-6 border-b flex flex-col items-center justify-center transition-colors ${getStatusColors(overallStatusColor)}`}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">Sejlbarhed Enehøje</h3>
                <div className="flex items-center gap-3">
                    <StatusIcon status={overallStatusColor} className="h-10 w-10" />
                    <h2 className="text-4xl font-black tracking-tight">{overallStatusText}</h2>
                </div>
            </div>

            <CardContent className="p-6">
                {/* Current Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* WIND */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                        <div className={`p-3 rounded-full ${getStatusColors(data.wind_status)}`}>
                            <Wind className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Aktuel Vind</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{data.wind_now_ms.toFixed(1)}</span>
                                <span className="text-gray-500">m/s</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Navigation2 className="h-3 w-3" style={{ transform: `rotate(${data.wind_direction}deg)` }} />
                                <span>{data.wind_direction}°</span>
                            </div>
                        </div>
                    </div>

                    {/* DEPTH */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                        <div className={`p-3 rounded-full ${data.depth_ok ? getStatusColors("SAFE") : getStatusColors("NO_GO")}`}>
                            <Waves className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 font-medium">Beregnet Vanddybde</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{data.calculated_depth_m.toFixed(2)}</span>
                                <span className="text-gray-500">m</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 flex justify-between">
                                <span>Næste lavvande: {new Date(data.next_low_tide.time).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7-Day Forecast */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Info className="h-4 w-4" /> 7-Dages Udsigt (Maks Vind)
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {data.forecast.map((day: any) => {
                            const dateObj = new Date(day.date)
                            const dayName = dateObj.toLocaleDateString('da-DK', { weekday: 'short' })

                            return (
                                <div key={day.date} className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center ${getStatusColors(day.wind_status)}`}>
                                    <span className="text-xs font-bold uppercase mb-1">{dayName}</span>
                                    <span className="font-bold text-lg leading-none mb-1">{day.max_wind_ms.toFixed(1)}</span>
                                    <span className="text-[10px] opacity-80">m/s</span>
                                    <StatusIcon status={day.wind_status} className="h-4 w-4 mt-2" />
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-6 text-right text-xs text-gray-400">
                    Sidst opdateret: {new Date(data.last_updated).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </CardContent>
        </Card>
    )
}
