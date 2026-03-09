import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  CloudSun, Droplets, Wind, Thermometer, Sun, Cloud, CloudRain,
  CloudSnow, CloudLightning, CloudFog, Loader2,
} from "lucide-react";

// WMO weather code to icon/description mapping
function getWeatherInfo(code: number) {
  if (code === 0) return { icon: Sun, label: "Céu limpo", emoji: "☀️" };
  if (code <= 3) return { icon: CloudSun, label: "Parcialmente nublado", emoji: "⛅" };
  if (code <= 48) return { icon: CloudFog, label: "Neblina", emoji: "🌫️" };
  if (code <= 57) return { icon: Droplets, label: "Garoa", emoji: "🌦️" };
  if (code <= 67) return { icon: CloudRain, label: "Chuva", emoji: "🌧️" };
  if (code <= 77) return { icon: CloudSnow, label: "Neve", emoji: "❄️" };
  if (code <= 82) return { icon: CloudRain, label: "Pancadas de chuva", emoji: "🌧️" };
  if (code <= 86) return { icon: CloudSnow, label: "Neve forte", emoji: "🌨️" };
  if (code <= 99) return { icon: CloudLightning, label: "Tempestade", emoji: "⛈️" };
  return { icon: Cloud, label: "Nublado", emoji: "☁️" };
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  farmName: string;
  compact?: boolean;
}

export default function WeatherWidget({ latitude, longitude, farmName, compact = false }: WeatherWidgetProps) {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("weather", {
        body: { latitude, longitude },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 min cache
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !weather?.current) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <CloudSun className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Não foi possível carregar o clima</p>
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  const weatherInfo = getWeatherInfo(current.weather_code);
  const WeatherIcon = weatherInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <WeatherIcon className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{Math.round(current.temperature_2m)}°C</p>
            <p className="text-xs text-muted-foreground">{weatherInfo.label}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{current.relative_humidity_2m}%</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{current.wind_speed_10m} km/h</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current conditions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <WeatherIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-foreground">{Math.round(current.temperature_2m)}°C</p>
            <p className="text-sm text-muted-foreground">{weatherInfo.label} — {farmName}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3" /> Umidade: {current.relative_humidity_2m}%
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Wind className="w-3 h-3" /> Vento: {current.wind_speed_10m} km/h
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <CloudRain className="w-3 h-3" /> Precip: {current.precipitation} mm
          </p>
        </div>
      </div>

      {/* 7-day forecast */}
      {daily && (
        <div className="grid grid-cols-7 gap-2">
          {daily.time.map((date: string, i: number) => {
            const d = new Date(date + "T12:00:00");
            const dayInfo = getWeatherInfo(daily.weather_code[i]);
            return (
              <div key={i} className="text-center p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                <p className="text-xs font-medium text-foreground">{WEEKDAYS[d.getDay()]}</p>
                <p className="text-xl my-1">{dayInfo.emoji}</p>
                <p className="text-xs font-bold text-foreground">{Math.round(daily.temperature_2m_max[i])}°</p>
                <p className="text-[10px] text-muted-foreground">{Math.round(daily.temperature_2m_min[i])}°</p>
                {daily.precipitation_sum[i] > 0 && (
                  <p className="text-[10px] text-info mt-0.5 flex items-center justify-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5" />{Math.round(daily.precipitation_sum[i])}mm
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
