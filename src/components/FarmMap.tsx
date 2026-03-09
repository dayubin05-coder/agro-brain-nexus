import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

interface FarmMapProps {
  fazendas: any[];
}

export function FarmMap({ fazendas }: FarmMapProps) {
  // Default center (Brazil)
  const defaultCenter: [number, number] = [-14.2350, -51.9253];
  
  // Find first farm with coordinates to center the map, otherwise use default
  const centerFarm = fazendas?.find(f => f.latitude && f.longitude);
  const center: [number, number] = centerFarm 
    ? [Number(centerFarm.latitude), Number(centerFarm.longitude)] 
    : defaultCenter;

  return (
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
                  // Converter as coordenadas para o formato esperado pelo Leaflet [lat, lng]
                  // Assumindo que no banco está salvo como array de [lat, lng] ou similar
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
  );
}
