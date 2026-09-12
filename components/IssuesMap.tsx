"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Issue = {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
};

export default function IssuesMap({ issues }: { issues: Issue[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded bg-gray-100">
        Map load ho raha hai...
      </div>
    );
  }

  const defaultCenter: [number, number] = [23.2599, 77.4126];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      {issues.map((issue) => (
        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
          <Popup>
            <strong>{issue.title}</strong>
            <br />
            {issue.category} — {issue.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
