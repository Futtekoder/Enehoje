export async function fetchWaterLevelWithFallback({ lat, lon }: { lat: number; lon: number }) {
    let currentWaterLevelM: number | null = null;
    let nextLowTide: { time: string; levelM: number; depthM?: number } | null = null;

    try {
        // Current tide
        const obsRes = await fetch("https://opendataapi.dmi.dk/v2/oceanObs/collections/observation/items?stationId=31417&parameterId=sea_reg&limit=1&sortorder=observed,DESC", { next: { revalidate: 300 } });
        if (obsRes.ok) {
            const obsData = await obsRes.json();
            if (obsData.features && obsData.features.length > 0) {
                currentWaterLevelM = obsData.features[0].properties.value / 100;
            }
        }

        // Next 12 hours tide
        const now = new Date();
        const plus12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const tideRes = await fetch(`https://opendataapi.dmi.dk/v2/oceanObs/collections/tidewater/items?stationId=31417&datetime=${now.toISOString()}/${plus12h.toISOString()}&limit=100`, { next: { revalidate: 300 } });

        if (tideRes.ok) {
            const tideData = await tideRes.json();
            if (tideData.features && tideData.features.length > 0) {
                const lowestPrediction = tideData.features.reduce((min: any, current: any) => current.properties.value < min.properties.value ? current : min, tideData.features[0]);
                nextLowTide = {
                    time: lowestPrediction.properties.predictionTime,
                    levelM: lowestPrediction.properties.value / 100
                };
            }
        }
    } catch (err) {
        console.error("DMI fetch failed", err);
        throw new Error("DMI Fetch Failed");
    }

    return {
        provider: "dmi" as const,
        currentLevelM: currentWaterLevelM,
        hourlyLevelM: null, // Simplification for now, we assume current level for the hours
        nextLowTide: nextLowTide
    };
}
