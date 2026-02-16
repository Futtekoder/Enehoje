import { getYearWeeks } from "@/lib/weeks"
import { cn } from "@/lib/utils"

export async function WeekGrid({ year }: { year: number }) {
    const weeks = await getYearWeeks(year)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
            {weeks.map((week) => (
                <div
                    key={week.weekNumber}
                    className={cn(
                        "p-3 rounded border text-center flex flex-col items-center justify-center",
                        // Fallback color if none defined
                        "bg-white dark:bg-zinc-800"
                    )}
                    style={{
                        borderColor: week.owner?.color === 'bg-red-500' ? '#ef4444' :
                            week.owner?.color === 'bg-blue-500' ? '#3b82f6' :
                                week.owner?.color === 'bg-green-500' ? '#22c55e' :
                                    week.owner?.color === 'bg-yellow-500' ? '#eab308' :
                                        week.owner?.color === 'bg-purple-500' ? '#a855f7' : '#e5e7eb'
                    }}
                >
                    <span className="text-sm font-bold text-gray-500">Uge {week.weekNumber}</span>
                    <span className={cn(
                        "font-semibold mt-1 px-2 py-0.5 rounded text-white text-xs",
                        // We can use the taiwind classes directly if we safelist them or use inline styles for dynamic colors
                        // For now, let's just map the seeded colors to classes that exist
                        week.owner?.color || "bg-gray-400"
                    )}>
                        {week.owner?.name || "Unassigned"}
                    </span>
                </div>
            ))}
        </div>
    )
}
