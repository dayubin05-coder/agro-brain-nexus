import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';
import L from 'leaflet';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileUp } from "lucide-react";
import { kml } from '@tmcw/togeojson';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

function GeomanSetup({ onPolygonCreate }: { onPolygonCreate: (coords: any[], layer: any) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
    });

    map.pm.setLang('pt_br');

    const handleCreate = (e: any) => {
      if (e.shape === 'Polygon') {
        const layer = e.layer;
        const latlngs = layer.getLatLngs()[0];
        const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
        onPolygonCreate(coords, layer);
      }
    };

    map.on('pm:create', handleCreate);

    return () => {
      map.pm.removeControls();
      map.off('pm:create', handleCreate);
    };
  }, [map, onPolygonCreate]);

  return null;
}

interface FarmMapProps {
  fazendas: any[];
}

export function FarmMap({ fazendas }: FarmMapProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDrawOpen, setIsDrawOpen] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<any[]>([]);
  const [currentLayer, setCurrentLayer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newTalhao, setNewTalhao] = useState({
    nome: '',
    area: '',
    fazenda_id: ''
  });

  // Default center (Brazil)
  const defaultCenter: [number, number] = [-14.2350, -51.9253];
  
  // Find first farm with coordinates to center the map, otherwise use default
  const centerFarm = fazendas?.find(f => f.latitude && f.longitude);
  const center: [number, number] = centerFarm 
    ? [Number(centerFarm.latitude), Number(centerFarm.longitude)] 
    : defaultCenter;

  const handlePolygonCreate = (coords: any[], layer: any) => {
    setCurrentCoords(coords);
    setCurrentLayer(layer);
    
    // Auto-select farm if there is only one
    if (fazendas && fazendas.length === 1) {
      setNewTalhao(prev => ({ ...prev, fazenda_id: fazendas[0].id }));
    }
    
    setIsDrawOpen(true);
  };

  const handleCancel = () => {
    if (currentLayer) {
      currentLayer.remove();
    }
    setIsDrawOpen(false);
    setNewTalhao({ nome: '', area: '', fazenda_id: '' });
  };

  const handleSave = async () => {
    if (!newTalhao.nome || !newTalhao.area || !newTalhao.fazenda_id) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.from('talhoes').insert({
        nome: newTalhao.nome,
        area: Number(newTalhao.area),
        fazenda_id: newTalhao.fazenda_id,
        coordenadas: currentCoords
      });
      
      if (error) throw error;
      
      toast({ title: "Talhão salvo com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["fazendas"] });
      
      if (currentLayer) {
        currentLayer.remove();
      }
      setIsDrawOpen(false);
      setNewTalhao({ nome: '', area: '', fazenda_id: '' });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="h-[500px] w-full rounded-xl overflow-hidden border border-border">
        <MapContainer 
          center={center} 
          zoom={centerFarm ? 12 : 4} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <GeomanSetup onPolygonCreate={handlePolygonCreate} />

          {fazendas?.map((farm) => {
            return (
              <div key={farm.id}>
                {farm.latitude && farm.longitude && (
                  <Marker position={[Number(farm.latitude), Number(farm.longitude)]}>
                    <Popup className="rounded-lg">
                      <div className="font-semibold text-base">{farm.nome}</div>
                      <div className="text-sm text-muted-foreground">{farm.area_total} ha</div>
                      {farm.cidade && <div className="text-xs mt-1">{farm.cidade} - {farm.estado}</div>}
                    </Popup>
                  </Marker>
                )}
                {farm.talhoes?.map((talhao: any) => {
                  if (talhao.coordenadas && Array.isArray(talhao.coordenadas)) {
                    const pos = talhao.coordenadas as [number, number][];
                    if (pos.length > 0) {
                      return (
                        <Polygon 
                          key={talhao.id} 
                          positions={pos}
                          pathOptions={{ color: 'hsl(142.1 76.2% 36.3%)', fillColor: 'hsl(142.1 76.2% 36.3%)', fillOpacity: 0.4 }}
                        >
                          <Popup>
                            <div className="font-semibold">{talhao.nome}</div>
                            <div className="text-sm">Área: {talhao.area} ha</div>
                            <div className="text-xs text-muted-foreground mt-1">Fazenda: {farm.nome}</div>
                          </Popup>
                        </Polygon>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            );
          })}
        </MapContainer>
      </div>

      <Dialog open={isDrawOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar Novo Talhão</DialogTitle>
            <DialogDescription>
              Você desenhou um novo polígono no mapa. Preencha os dados para salvá-lo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fazenda">Fazenda</Label>
              <Select 
                value={newTalhao.fazenda_id} 
                onValueChange={(val) => setNewTalhao({...newTalhao, fazenda_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fazenda" />
                </SelectTrigger>
                <SelectContent>
                  {fazendas?.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome ou Identificação do Talhão</Label>
              <Input 
                id="nome" 
                value={newTalhao.nome}
                onChange={(e) => setNewTalhao({...newTalhao, nome: e.target.value})}
                placeholder="Ex: Talhão 01, Lote Sul..." 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Área (hectares)</Label>
              <Input 
                id="area" 
                type="number"
                min="0"
                step="0.01"
                value={newTalhao.area}
                onChange={(e) => setNewTalhao({...newTalhao, area: e.target.value})}
                placeholder="Ex: 50.5" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Talhão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
