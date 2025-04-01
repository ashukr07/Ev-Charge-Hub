import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useStationStore from "../stores/stationStore";

const evChargeHubIcon = L.icon({
  iconUrl: "/evchargehub-marker.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const stationIcon = L.icon({
  iconUrl: "/evchargehub-marker-selected.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14); // Zooms into user's location
  }, [center, map]);
  return null;
}

export default function MapSelector({ onLocationSelect }) {
  const { stations, fetchStations } = useStationStore();
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default to New Delhi

  useEffect(() => {
    fetchStations();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onLocationSelect(latitude, longitude);
      },
      () => console.error("Geolocation permission denied")
    );
  }, []);

  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <MapContainer center={position} zoom={14} className="h-96 w-full rounded-lg">
      <MapUpdater center={position} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Existing Stations */}
      {stations.map((station) => (
        <Marker key={station._id} position={[station.location.latitude, station.location.longitude]} icon={stationIcon}>
          <Popup>
            <strong>{station.name}</strong>
            <p>{station.address}</p>
          </Popup>
        </Marker>
      ))}

      {/* Draggable Marker for Selecting New Station */}
      <Marker position={position} icon={evChargeHubIcon} draggable={true} eventHandlers={{ dragend: handleMarkerDrag }}>
        <Popup>Drag to select station location</Popup>
      </Marker>
    </MapContainer>
  );
}
