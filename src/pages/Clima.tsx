import { motion } from "framer-motion";
import {
  CloudSun, Droplets, Wind, Thermometer, CloudRain,
  AlertTriangle, Loader2,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import WeatherWidget from "@/components/WeatherWidget";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Clima() {
  const { data: userData } = useCurrentUser();

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ["clima-fazendas"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fazendas")
        .select("id, nome, latitude, longitude, cidade, estado")
        .eq("user_id", userData?.id!);
      if (error) throw error;
      return data;
    },
  });

  const farmsWithCoords = fazendas?.filter(f => f.latitude && f.longitude) || [];

  // Fetch weather for the primary farm to get hourly data for charts
  const primaryFarm = farmsWithCoords[0];
  const { data: weatherData } = useQuery({
    queryKey: ["clima-weather", primaryFarm?.latitude, primaryFarm?.longitude],
    enabled: !!primaryFarm,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("weather", {
        body: { latitude: primaryFarm!.latitude, longitude: primaryFarm!.longitude },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

  // Build hourly temperature chart data (today only, every 2 hours)
  const tempChartData = weatherData?.hourly?.time
    ?.slice(0, 24)
    .filter((_: string, i: number) => i % 2 === 0)
    .map((time: string, i: number) => ({
      hora: new Date(time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      temp: weatherData.hourly.temperature_2m[i * 2],
    })) || [];

  // Build daily precipitation chart data
  const precipChartData = weatherData?.daily?.time?.map((date: string, i: number) => ({
    dia: new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }),
    valor: Math.round(weatherData.daily.precipitation_sum[i]),
  })) || [];

  const current = weatherData?.current;

  // Generate weather alerts
  const alerts: { tipo: string; desc: string; severidade: string; data: string }[] = [];
  if (weatherData?.daily) {
    weatherData.daily.precipitation_sum.forEach((precip: number, i: number) => {
      if (precip > 40) {
        const date = new Date(weatherData.daily.time[i] + "T12:00:00");
        alerts.push({
          tipo: "Chuva forte prevista",
          desc: `Previsão de ${Math.round(precip)}mm. Possibilidade de alagamento em áreas baixas.`,
          severidade: "alta",
          data: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        });
      }
    });
    weatherData.daily.temperature_2m_min.forEach((min: number, i: number) => {
      if (min < 5) {
        const date = new Date(weatherData.daily.time[i] + "T12:00:00");
        alerts.push({
          tipo: "Risco de geada",
          desc: `Temperatura mínima prevista de ${Math.round(min)}°C. Proteja culturas sensíveis.`,
          severidade: "alta",
          data: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        });
      }
    });
    weatherData.daily.temperature_2m_max.forEach((max: number, i: number) => {
      if (max > 38) {
        const date = new Date(weatherData.daily.time[i] + "T12:00:00");
        alerts.push({
          tipo: "Calor extremo",
          desc: `Temperatura máxima de ${Math.round(max)}°C. Atenção ao estresse hídrico das culturas.`,
          severidade: "media",
          data: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Monitoramento Climático</h1>
        <p className="text-muted-foreground text-sm mt-1">Previsão do tempo real para suas fazendas via Open-Meteo</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : farmsWithCoords.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-10 shadow-card border border-border text-center">
          <CloudSun className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="font-display font-semibold text-foreground text-lg">Nenhuma fazenda com coordenadas</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Cadastre uma fazenda com latitude e longitude para ver o clima em tempo real.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Current metrics */}
          {current && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={Thermometer} title="Temperatura Atual" value={`${Math.round(current.temperature_2m)}°C`}
                change={weatherData?.daily ? `Máx: ${Math.round(weatherData.daily.temperature_2m_max[0])}°C / Mín: ${Math.round(weatherData.daily.temperature_2m_min[0])}°C` : ""}
                changeType="neutral" delay={0} />
              <MetricCard icon={Droplets} title="Umidade do Ar" value={`${current.relative_humidity_2m}%`}
                change={current.relative_humidity_2m >= 50 && current.relative_humidity_2m <= 80 ? "Ideal para pulverização" : "Fora da faixa ideal"}
                changeType={current.relative_humidity_2m >= 50 && current.relative_humidity_2m <= 80 ? "positive" : "neutral"} delay={0.1} />
              <MetricCard icon={Wind} title="Vento" value={`${Math.round(current.wind_speed_10m)} km/h`}
                change={current.wind_speed_10m < 15 ? "Favorável para pulverização" : "Vento forte - evite pulverizar"}
                changeType={current.wind_speed_10m < 15 ? "positive" : "negative"} delay={0.2} />
              <MetricCard icon={CloudRain} title="Precipitação Hoje" value={`${weatherData?.daily?.precipitation_sum?.[0] ?? 0} mm`}
                change="Acumulado do dia" changeType="neutral" delay={0.3} />
            </div>
          )}

          {/* Weather widgets per farm */}
          {farmsWithCoords.map((farm, i) => (
            <motion.div key={farm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4">
                {farm.nome} {farm.cidade && farm.estado ? `— ${farm.cidade}, ${farm.estado}` : ""}
              </h3>
              <WeatherWidget latitude={farm.latitude!} longitude={farm.longitude!} farmName={farm.nome} />
            </motion.div>
          ))}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tempChartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-4">Temperatura Hoje (°C)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={tempChartData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
                    <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="temp" stroke="hsl(0, 72%, 51%)" fill="url(#tempGrad)" strokeWidth={2} name="Temp." />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {precipChartData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-4">Precipitação 7 Dias (mm)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={precipChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="valor" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} name="Precipitação" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Climate alerts */}
          {alerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Alertas Climáticos</h3>
                <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">{alerts.length} alerta{alerts.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    a.severidade === "alta" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      a.severidade === "alta" ? "bg-destructive/10" : "bg-warning/10"
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${a.severidade === "alta" ? "text-destructive" : "text-warning"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.tipo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{a.data}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
