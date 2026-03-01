export async function fetchOpenMeteoWindAndForecast({ lat, lon }: { lat: number; lon: number }) {
    const meteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
    meteoUrl.searchParams.append("latitude", lat.toString());
    meteoUrl.searchParams.append("longitude", lon.toString());
    meteoUrl.searchParams.append("current", "wind_speed_10m,wind_direction_10m");
    meteoUrl.searchParams.append("hourly", "wind_speed_10m");
    meteoUrl.searchParams.append("daily", "wind_speed_10m_max,weather_code,temperature_2m_max,wind_direction_10m_dominant");
    meteoUrl.searchParams.append("timezone", "Europe/Copenhagen");
    meteoUrl.searchParams.append("forecast_days", "7");
    meteoUrl.searchParams.append("wind_speed_unit", "ms");

    const meteoRes = await fetch(meteoUrl.toString(), {
        next: { revalidate: 300 }
    });

    if (!meteoRes.ok) {
        throw new Error(`Open-Meteo API Error: ${meteoRes.status}`);
    }

    const data = await meteoRes.json();

    const current = data.current ? {
        windMs: data.current.wind_speed_10m,
        windDirectionDeg: data.current.wind_direction_10m
    } : null;

    const hourly = data.hourly?.time?.map((t: string, i: number) => ({
        time: t,
        windMs: data.hourly.wind_speed_10m[i]
    })) || [];

    const daily7d = data.daily?.time?.map((t: string, i: number) => ({
        date: t,
        maxWindMs: data.daily.wind_speed_10m_max[i],
        weatherCode: data.daily.weather_code[i],
        maxTempC: data.daily.temperature_2m_max[i],
        windDirectionDominantDeg: data.daily.wind_direction_10m_dominant[i]
    })) || [];

    return { current, hourly, daily7d };
}
