"use client"

import useSWR from "swr"
import { Wind, Waves, AlertTriangle, CheckCircle2, XCircle, Info, Navigation2, Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Clock } from "lucide-react"
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

    if (error || !data || data.sailingStatus === undefined) {
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
    const WeatherIcon = ({ code, className = "" }: { code: number, className?: string }) => {
        if (code === 0) return <Sun className={className} />;
        if (code === 1 || code === 2) return <CloudSun className={className} />;
        if (code === 3) return <Cloud className={className} />;
        if (code === 45 || code === 48) return <CloudFog className={className} />;
        if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={className} />;
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={className} />;
        if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={className} />;
        if ([95, 96, 99].includes(code)) return <CloudLightning className={className} />;
        return <Cloud className={className} />;
    }

    const getStatusColors = (status: string) => {
        switch (status) {
            case "SAFE":
                return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
            case "CAUTION":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
            case "NO_GO":
            case "NONE":
                return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            case "UNKNOWN":
            default:
                return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
        }
    }

    const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
        if (status === "SAFE") return <CheckCircle2 className={`text-green-600 dark:text-green-500 ${className}`} />
        if (status === "CAUTION") return <AlertTriangle className={`text-yellow-600 dark:text-yellow-500 ${className}`} />
        if (status === "UNKNOWN") return <Info className={`text-gray-500 ${className}`} />
        return <XCircle className={`text-red-600 dark:text-red-500 ${className}`} />
    }

    const overallStatusText = data.sailingStatus === "SAFE" ? "SAFE TO SAIL" : data.sailingStatus === "CAUTION" ? "CAUTION" : data.sailingStatus === "UNKNOWN" ? "UNKNOWN" : "DO NOT SAIL"
    const overallStatusColor = data.sailingStatus

    const formatTimeRange = (start?: string, end?: string) => {
        if (!start || !end) return "";
        const s = new Date(start).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const e = new Date(end).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        return `${s} – ${e}`;
    }

    const getBestWindowCopy = (status: string) => {
        if (status === "SAFE") return "BEDSTE SEJLADS I DAG";
        if (status === "CAUTION") return "BEDSTE SEJLADS (TÆT PÅ GRÆNSEN)";
        if (status === "NONE") return "INGEN SIKRE TIDER I DAG";
        return "UTILGÆNGELIGT LIGE NU";
    }

    const getCompassDirection = (deg: number | null | undefined) => {
        if (deg === null || deg === undefined) return "-";
        const val = Math.floor((deg / 45) + 0.5);
        const arr = ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"];
        return arr[(val % 8)];
    }

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
                        <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColors(data.windStatus)}`}>
                            <Wind className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aktuel Vind</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black leading-none">{data.windNowMs !== null ? data.windNowMs.toFixed(1) : '-'}</span>
                                <span className="text-xs text-gray-500 font-medium">m/s</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 font-medium">
                                <Navigation2 className="h-3 w-3" style={{ transform: `rotate(${data.windDirectionDeg || 0}deg)` }} />
                                <span>{getCompassDirection(data.windDirectionDeg)}</span>
                            </div>
                        </div>
                    </div>

                    {/* DEPTH */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/50">
                        <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColors(data.depthStatus)}`}>
                            <Waves className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col w-full">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Vanddybde</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black leading-none">{data.depthNowM !== null ? data.depthNowM.toFixed(2) : '-'}</span>
                                <span className="text-xs text-gray-500 font-medium">m</span>
                            </div>
                            {data.nextLowTide && (
                                <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                                    Lavvande: {new Date(data.nextLowTide.time).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Best Window Today Block */}
                <div className={`mb-4 p-3 rounded-lg border flex flex-col gap-1 ${getStatusColors(data.bestWindowToday?.status || 'UNKNOWN')}`}>
                    <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {getBestWindowCopy(data.bestWindowToday?.status || 'UNKNOWN')}
                        </span>
                        <span className="text-[8px] uppercase font-bold opacity-60">
                            Beregnet ud fra prognose
                        </span>
                    </div>

                    {data.bestWindowToday?.status === "SAFE" || data.bestWindowToday?.status === "CAUTION" ? (
                        <>
                            <div className="text-xl font-black mt-0.5">
                                {formatTimeRange(data.bestWindowToday.start, data.bestWindowToday.end)}
                            </div>
                            <div className="text-[10px] font-medium opacity-90">
                                Vind: {data.bestWindowToday.windMinMs}-{data.bestWindowToday.windMaxMs} m/s • Dybde: {data.bestWindowToday.depthMinM?.toFixed(2)}-{data.bestWindowToday.depthMaxM?.toFixed(2)} m
                            </div>
                        </>
                    ) : (
                        <div className="text-sm font-bold mt-1 opacity-80">
                            {data.bestWindowToday?.status === "NONE" ? "Ingen forsvarlige tidsrum fundet for resten af dagen." : "Data ikke tilgængelig for at beregne vindue."}
                        </div>
                    )}
                </div>

                {/* 7-Day Forecast - Compact Horizontal Scroll/Grid */}
                {data.forecast7d && data.forecast7d.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Info className="h-3 w-3" /> 7-Dages Vejrudsigt
                        </h4>

                        <div className="grid grid-cols-7 gap-1.5">
                            {data.forecast7d.map((day: any) => {
                                const dateObj = new Date(day.date)
                                const dayName = dateObj.toLocaleDateString('da-DK', { weekday: 'short' }).replace('.', '')

                                return (
                                    <div key={day.date} className={`flex flex-col items-center justify-center py-2 px-1 rounded-md border ${getStatusColors(day.windStatus)}`}>
                                        <span className="text-[9px] font-bold uppercase mb-0.5 opacity-80">{dayName}</span>
                                        <WeatherIcon code={day.weatherCode} className="h-5 w-5 my-1 opacity-90" />
                                        <span className="font-extrabold text-[10px] flex items-baseline gap-0.5">
                                            {Math.round(day.maxWindMs)}
                                            <span className="text-[7px] font-bold opacity-80">m/s</span>
                                        </span>
                                        {day.windDirectionDominantDeg !== undefined && (
                                            <span className="text-[8px] font-semibold text-gray-400 -mt-0.5 mb-0.5 flex items-center gap-0.5">
                                                <Navigation2 className="h-2 w-2" style={{ transform: `rotate(${day.windDirectionDominantDeg}deg)` }} />
                                                {getCompassDirection(day.windDirectionDominantDeg)}
                                            </span>
                                        )}
                                        {day.maxTempC !== undefined && (
                                            <span className="text-[9px] font-semibold mt-0.5 opacity-90">
                                                {Math.round(day.maxTempC)}°
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-3 flex justify-between items-center text-[9px] text-gray-400 font-medium">
                    <span className="uppercase opacity-70">
                        {data.meta?.source === "CACHE" && "C"}
                        {data.meta?.source === "DEGRADED" && "D"}
                    </span>
                    <span>
                        Opdateret: {new Date(data.meta?.updatedAt || new Date()).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
