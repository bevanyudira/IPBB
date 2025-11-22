"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix untuk default marker icons di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    nop: string;
    luas: number;
    kd_propinsi: string;
    kd_dati2: string;
    kd_kecamatan: string;
    kd_kelurahan: string;
    kd_blok: string;
    no_urut: string;
    kd_jns_op: string;
  };
}

interface MapViewProps {
  geojson: GeoJSONFeature;
}

// Component untuk auto-fit bounds
function FitBounds({ geojson }: { geojson: GeoJSONFeature }) {
  const map = useMap();

  useEffect(() => {
    if (geojson && geojson.geometry && geojson.geometry.coordinates) {
      const geoJsonLayer = L.geoJSON(geojson as any);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geojson, map]);

  return null;
}

export default function MapView({ geojson }: MapViewProps) {
  // Default center (akan di-override oleh FitBounds)
  const defaultCenter: [number, number] = [-2.2, 113.9];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <GeoJSON
          data={geojson as any}
          style={{
            color: "#3388ff",
            weight: 2,
            opacity: 0.8,
            fillColor: "#3388ff",
            fillOpacity: 0.3,
          }}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              const props = feature.properties;
              const popupContent = `
                <div style="min-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 8px;">Informasi Objek Pajak</h3>
                  <table style="width: 100%; font-size: 12px;">
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>NOP:</strong></td><td>${props.nop || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Luas:</strong></td><td>${props.luas ? props.luas + " m²" : "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Propinsi:</strong></td><td>${props.kd_propinsi || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Dati2:</strong></td><td>${props.kd_dati2 || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Kecamatan:</strong></td><td>${props.kd_kecamatan || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Kelurahan:</strong></td><td>${props.kd_kelurahan || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>Blok:</strong></td><td>${props.kd_blok || "-"}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0;"><strong>No. Urut:</strong></td><td>${props.no_urut || "-"}</td></tr>
                  </table>
                </div>
              `;
              layer.bindPopup(popupContent);
            }
          }}
        />
        <FitBounds geojson={geojson} />
      </MapContainer>
    </div>
  );
}
