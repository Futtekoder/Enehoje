"use client"

import { useState } from "react"
import { PlayCircle, CheckCircle, Circle } from "lucide-react"

export function SectionClient({ section, region }: { section: any, region?: string }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

    // S3 Public URL formulation
    // BUCKET_NAME is enhoeje-v2, Region is us-east-1 typically, but we use env vars. Since it's client component, env vars are missing unless NEXT_PUBLIC. 
    // We assume standard path from API: BUCKET_NAME.s3.REGION.amazonaws.com
    // To make it rock solid, we'll just hardcode the path structure or pass it. 
    // A better way is: `https://enhoeje-v2.s3.${region || 'eu-north-1'}.amazonaws.com/${section.videoKey}`
    // Let's assume bucket name is known to be 'enhoeje-v2' based on previous context, and we'll fallback Region to eu-north-1.
    const videoUrl = section.videoKey ? `https://enhoeje-v2.s3.${region || 'eu-north-1'}.amazonaws.com/${section.videoKey}` : null

    const formatBytes = (bytes: number) => {
        if (!bytes) return ''
        const mb = bytes / (1024 * 1024)
        return `(${mb.toFixed(1)} MB)`
    }

    const toggleCheck = (id: string) => {
        const next = new Set(checkedItems)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setCheckedItems(next)
    }

    const markAllDone = () => {
        const allIds = section.checklist.map((c: any) => c.id)
        setCheckedItems(new Set(allIds))

        // Small visual feedback ping
        setTimeout(() => {
            alert("Alt afkrydset og færdigt!")
        }, 300)
    }

    const allChecked = section.checklist.length > 0 && checkedItems.size === section.checklist.length

    return (
        <div className="space-y-10">

            {/* Lazy Video Player */}
            {section.videoKey && (
                <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative group border border-gray-800">
                    {!isPlaying ? (
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900/40 hover:bg-gray-900/20 transition-all"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60"></div>

                            <div className="relative z-10 flex flex-col items-center transform group-hover:scale-105 transition-transform">
                                <PlayCircle className="w-16 h-16 text-white mb-3 shadow-xl rounded-full bg-black/20" />
                                <span className="text-white font-semibold text-lg drop-shadow-md">
                                    Afspil video {formatBytes(section.videoSize)}
                                </span>
                            </div>
                        </button>
                    ) : (
                        <video
                            src={videoUrl!}
                            controls
                            autoPlay
                            className="w-full h-full object-contain bg-black"
                            controlsList="nodownload"
                        />
                    )}
                </div>
            )}

            {/* Checklist */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tjekliste</h3>

                {section.checklist.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        Checklist kommer snart.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {section.checklist.map((item: any, idx: number) => {
                            const isChecked = checkedItems.has(item.id)
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleCheck(item.id)}
                                    className={`w-full flex items-start text-left p-4 rounded-2xl border-2 transition-all ${isChecked
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/50"
                                            : "border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5 mr-4">
                                        {isChecked ? (
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                        )}
                                    </div>
                                    <span className={`text-base font-medium transition-colors ${isChecked ? "text-emerald-900 dark:text-emerald-300 line-through opacity-70" : "text-gray-800 dark:text-gray-200"
                                        }`}>
                                        {item.text}
                                    </span>
                                </button>
                            )
                        })}

                        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={markAllDone}
                                disabled={allChecked}
                                className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${allChecked
                                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
                                    }`}
                            >
                                {allChecked ? "Alt fuldført 🎉" : "✓ Marker alle som færdige"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
