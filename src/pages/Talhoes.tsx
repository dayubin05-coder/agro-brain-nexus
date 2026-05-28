import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers, Ruler, Sprout, Search, Loader2, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TalhoesManager from "@/components/TalhoesManager";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatNumberBR } from "@/lib/formatters";

// Fix default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Talhao {
  id: string;
  nome: string;
  area: number;
  coordenadas: [number, number][] | null;
  observacoes: string | null;
  fazenda_id: string;
  fazenda_nome: string;
  fazenda_cidade: string | null;
  fazenda_estado: string | null;
  plantios_count: number;
}

export default function TalhoesDashboard() {
  const [search, setSearch] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [manageFarm, setManageFarm] = useState<{ id: string; nome: string } | null>(null);

  const { data: user } = useCurrentUser();

  const { data: talhoes, isLoading } = useQuery({
    queryKey: ["talhoes-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talhoes")
        .select(`
          id, nome, area, coordenadas, observacoes, fazenda_id,
          fazendas!inner (id, nome, cidade, estado, user_id),
          plantios (id)
        `)
        .eq("fazendas.user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        nome: t.nome,
        area: t.area,
        coordenadas: t.coordenadas,
        observacoes: t.observacoes,
        fazenda_id: t.fazenda_id,
        fazenda_nome: t.fazendas.nome,
        fazenda_cidade: t.fazendas.cidade,
        fazenda_estado: t.fazendas.estado,
        plantios_count: t.plantios?.length || 0,
      })) as Talhao[];
    },
  });

  const farms = useMemo(() => {
    if (!talhoes) return [];
    const map = new Map<string, string>();
    talhoes.forEach((t) => map.set(t.fazenda_id, t.fazenda_nome));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [talhoes]);

  const filtered = useMemo(() => {
    if (!talhoes) return [];
    return talhoes.filter((t) => {
      const matchSearch = t.nome.toLowerCase().includes(search.toLowerCase()) ||
        t.fazenda_nome.toLowerCase().includes(search.toLowerCase());
      const matchFarm = selectedFarm === "all" || t.fazenda_id === selectedFarm;
      return matchSearch && matchFarm;
    });
  }, [talhoes, search, selectedFarm]);

  const totalArea = filtered.reduce((acc, t) => acc + Number(t.area), 0);
  const withCoords = filtered.filter((t) => t.coordenadas && Array.isArray(t.coordenadas) && t.coordenadas.length > 0);

  // Map center: first talhão with coords, or Brazil center
  const mapCenter = useMemo((): [number, number] => {
    const first = withCoords[0];
    if (first && first.coordenadas && first.coordenadas.length > 0) {
      const coords = first.coordenadas;
      const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
      const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
      return [lat, lng];
    }
    return [-14.235, -51.9253];
  }, [withCoords]);

  const getNdviValue = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100) / 100;
  };

  const getNdviColor = (ndvi: number): string => {
    if (ndvi < 0.2) return "#d73027";
    if (ndvi < 0.35) return "#fc8d59";
    if (ndvi < 0.5) return "#fee08b";
    if (ndvi < 0.65) return "#d9ef8b";
    if (ndvi < 0.8) return "#66bd63";
    return "#1a9850";
  };

  const getNdviLabel = (ndvi: number): string => {
    if (ndvi < 0.2) return "Muito Baixo";
    if (ndvi < 0.35) return "Baixo";
    if (ndvi < 0.5) return "Moderado";
    if (ndvi < 0.65) return "Bom";
    if (ndvi < 0.8) return "Alto";
    return "Muito Alto";
  };

  const statCards = [
    { label: "Total de Talhões", value: filtered.length, icon: Layers, color: "text-primary" },
    { label: "Área Total", value: `${totalArea.toLocaleString("pt-BR")} ha`, icon: Ruler, color: "text-secondary" },
    { label: "Com Plantio Ativo", value: filtered.filter((t) => t.plantios_count > 0).length, icon: Sprout, color: "text-success" },
    { label: "Mapeados (GPS)", value: withCoords.length, icon: MapPin, color: "text-info" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard de Talhões</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize e gerencie todos os talhões das suas propriedades
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar talhão ou fazenda..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFarm("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedFarm === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todas
          </button>
          {farms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFarm(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFarm === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.nome}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="mapa" className="w-full">
          <TabsList>
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="mapa" className="mt-4">
            <div className="h-[500px] w-full rounded-xl overflow-hidden border border-border">
              <MapContainer
                center={mapCenter}
                zoom={withCoords.length > 0 ? 13 : 4}
                scrollWheelZoom
                style={{ height: "100%", width: "100%", zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                {filtered.map((talhao) => {
                  if (!talhao.coordenadas || !Array.isArray(talhao.coordenadas) || talhao.coordenadas.length === 0)
                    return null;
                  const ndvi = getNdviValue(talhao.id);
                  const color = getNdviColor(ndvi);
                  return (
                    <Polygon
                      key={talhao.id}
                      positions={talhao.coordenadas}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.55,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">{talhao.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            Fazenda: {talhao.fazenda_nome}
                          </div>
                          <div className="text-xs">Área: {talhao.area} ha</div>
                          <div className="flex items-center gap-1.5 pt-1 border-t">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium">
                              NDVI: {ndvi.toFixed(2)} — {getNdviLabel(ndvi)}
                            </span>
                          </div>
                          {talhao.plantios_count > 0 && (
                            <div className="text-xs text-success font-medium">
                              {talhao.plantios_count} plantio(s) ativo(s)
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Polygon>
                  );
                })}
              </MapContainer>
            </div>

            {/* NDVI Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">NDVI (Simulado):</span>
              {[
                { color: "#1a9850", label: "Muito Alto" },
                { color: "#66bd63", label: "Alto" },
                { color: "#d9ef8b", label: "Bom" },
                { color: "#fee08b", label: "Moderado" },
                { color: "#fc8d59", label: "Baixo" },
                { color: "#d73027", label: "Muito Baixo" },
              ].map((item) => (
                <div key={item.color} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="lista" className="mt-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">Nenhum talhão encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((talhao, i) => {
                  const ndvi = getNdviValue(talhao.id);
                  const color = getNdviColor(ndvi);
                  return (
                    <motion.div
                      key={talhao.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className="border-border hover:shadow-card-hover transition-shadow cursor-pointer group"
                        onClick={() =>
                          setManageFarm({ id: talhao.fazenda_id, nome: talhao.fazenda_nome })
                        }
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{talhao.nome}</h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {talhao.fazenda_nome}
                                {talhao.fazenda_cidade && ` · ${talhao.fazenda_cidade}`}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium text-foreground">{talhao.area} ha</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                              <span className="text-muted-foreground">
                                NDVI: {ndvi.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {talhao.coordenadas && talhao.coordenadas.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" /> Mapeado
                              </Badge>
                            )}
                            {talhao.plantios_count > 0 && (
                              <Badge variant="default" className="text-xs bg-success text-success-foreground">
                                <Sprout className="w-3 h-3 mr-1" /> {talhao.plantios_count} plantio(s)
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {manageFarm && (
        <TalhoesManager
          farmId={manageFarm.id}
          farmName={manageFarm.nome}
          open={!!manageFarm}
          onOpenChange={(o) => !o && setManageFarm(null)}
        />
      )}
    </div>
  );
}
