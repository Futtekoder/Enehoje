import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // 1. Extract Environment Variables
    const MARINE_LAT = process.env.MARINE_LAT || "54.838722";
    const MARINE_LON = process.env.MARINE_LON || "11.024556";
    const BASE_DEPTH = parseFloat(process.env.BASE_DEPTH || "1.35");
    const MIN_REQUIRED_DEPTH = parseFloat(process.env.MIN_REQUIRED_DEPTH || "1.0");
    const MAX_ALLOWED_WIND = parseFloat(process.env.MAX_ALLOWED_WIND || "13");

    try {
        // 2. Fetch from Open-Meteo API
        const meteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
        meteoUrl.searchParams.append("latitude", MARINE_LAT);
        meteoUrl.searchParams.append("longitude", MARINE_LON);
        meteoUrl.searchParams.append("current", "wind_speed_10m,wind_direction_10m");
        meteoUrl.searchParams.append("daily", "wind_speed_10m_max");
        meteoUrl.searchParams.append("timezone", "Europe/Copenhagen");
        // Ensure we get 7 days of forecast
        meteoUrl.searchParams.append("forecast_days", "7");

        const meteoRes = await fetch(meteoUrl.toString(), {
            // Next.js Cache - Revalidate every 5 minutes (300 seconds)
            next: { revalidate: 300 }
        });

        if (!meteoRes.ok) {
            throw new Error(`Open-Meteo API Error: ${meteoRes.status}`);
        }

        const meteoData = await meteoRes.json();

        // Extract Current Wind Data
        const currentWindMs = meteoData.current.wind_speed_10m;
        const currentWindDir = meteoData.current.wind_direction_10m;

        // 3. Helper Function to Calculate Wind Status
        const getWindStatus = (windSpeed: number): "SAFE" | "CAUTION" | "NO_GO" => {
            if (windSpeed < 11) return "SAFE";
            if (windSpeed >= 11 && windSpeed < MAX_ALLOWED_WIND) return "CAUTION";
            return "NO_GO";
        };

        const currentWindStatus = getWindStatus(currentWindMs);

        // 4. DMI Open Data v2 Integration (No API Key Required)
        // Station 31417 is Nakskov I (closest tide station to Enehøje)
        let currentWaterLevelM = 0;
        let nextLowTide = {
            time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            level_m: 0
        };

        try {
            // Fetch Current Tide Observation
            const obsRes = await fetch("https://opendataapi.dmi.dk/v2/oceanObs/collections/observation/items?stationId=31417&parameterId=sea_reg&limit=1&sortorder=observed,DESC", { next: { revalidate: 300 } });
            if (obsRes.ok) {
                const obsData = await obsRes.json();
                if (obsData.features && obsData.features.length > 0) {
                    // DMI returns centimeters, divide by 100 for meters
                    currentWaterLevelM = obsData.features[0].properties.value / 100;
                }
            }

            // Fetch Next 12 Hours of Tide Predictions to find Low Tide
            const now = new Date();
            const plus12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
            const tideRes = await fetch(`https://opendataapi.dmi.dk/v2/oceanObs/collections/tidewater/items?stationId=31417&datetime=${now.toISOString()}/${plus12h.toISOString()}&limit=100`, { next: { revalidate: 300 } });

            if (tideRes.ok) {
                const tideData = await tideRes.json();
                if (tideData.features && tideData.features.length > 0) {
                    // Find the prediction with the lowest value
                    const lowestPrediction = tideData.features.reduce((min: any, current: any) => current.properties.value < min.properties.value ? current : min, tideData.features[0]);
                    nextLowTide = {
                        time: lowestPrediction.properties.predictionTime,
                        level_m: lowestPrediction.properties.value / 100
                    };
                }
            }
        } catch (dmiError) {
            console.error("DMI fetch failed, falling back to 0m fluctuation:", dmiError);
        }

        const calculatedDepthM = BASE_DEPTH + currentWaterLevelM;
        const depthOk = calculatedDepthM >= MIN_REQUIRED_DEPTH;

        // 5. Total Status
        const windOk = currentWindMs < MAX_ALLOWED_WIND;
        const sailingOk = windOk && depthOk;

        // 6. Format the 7-Day Forecast Array
        const forecast = meteoData.daily.time.map((dateString: string, index: number) => {
            const maxWindMs = meteoData.daily.wind_speed_10m_max[index];
            return {
                date: dateString,
                max_wind_ms: maxWindMs,
                wind_status: getWindStatus(maxWindMs),
                min_depth_m: BASE_DEPTH // Mocked for now, assumes no tide changes
            };
        });

        // 7. Construct Final Response Payload
        const responseData = {
            wind_now_ms: currentWindMs,
            wind_direction: currentWindDir,
            wind_status: currentWindStatus,

            water_level_m: currentWaterLevelM,
            calculated_depth_m: calculatedDepthM,
            depth_ok: depthOk,

            sailing_ok: sailingOk,

            next_low_tide: nextLowTide,

            forecast: forecast,

            last_updated: new Date().toISOString()
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Failed to fetch marine status:", error);

        // Format Failure Payload defined in Spec
        return NextResponse.json({
            wind_status: "UNKNOWN",
            sailing_ok: false,
            error: "Conditions currently unavailable"
        }, { status: 503 });
    }
}
