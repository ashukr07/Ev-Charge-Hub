import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import toast from "react-hot-toast";

// Function to create a square marker with a bottom pointer
const createSquareIcon = (status, isSelected) => {
  let borderColor = "border-yellow-500";
  let triangleColor = "border-t-yellow-500";

  if (status === "inactive") {
    borderColor = "border-gray-400";
    triangleColor = "border-t-gray-400";
  } else if (isSelected) {
    borderColor = "border-green-500";
    triangleColor = "border-t-green-500";
  }

  return L.divIcon({
    className: "relative",
    html: `
      <div class="relative flex flex-col items-center">
        <!-- Square Box -->
        <div class="w-10 h-10 bg-white border-4 ${borderColor} flex items-center justify-center rounded-md shadow-lg">
          <img src="/evchargehub-logo.png" class="w-8 h-8" />
        </div>
        <!-- Triangle Pointer -->
        <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 ${triangleColor} border-transparent"></div>
      </div>`,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Handles zooming into the selected station or user location
function MapZoomHandler({ selectedStation, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStation) {
      map.setView(
        [selectedStation.location.latitude, selectedStation.location.longitude],
        15,
        { animate: true }
      );
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 14, { animate: true });
    }
  }, [selectedStation, userLocation, map]);

  return null;
}

export default function MapComponent({ stations, onSelect, selectedStation, userLocation }) {
  const defaultPosition = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [28.6139, 77.2090]; // Default to New Delhi

  return (
    <MapContainer center={defaultPosition} zoom={13} className="h-full w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Auto Zoom Effect */}
      <MapZoomHandler selectedStation={selectedStation} userLocation={userLocation} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Charging Stations */}
      {stations.map((station) => {
        const isSelected = selectedStation && selectedStation._id === station._id;
        const isActive = station.status === "active";

        return (
          <Marker
            key={station._id}
            position={[station.location.latitude, station.location.longitude]}
            icon={createSquareIcon(station.status, isSelected)}
            eventHandlers={{
              click: () => {
                if (!isActive) {
                  toast.error("⚠️ This station is currently inactive.");
                  return;
                }
                onSelect(station);
              },
            }}
          >
            <Popup>
              <h3 className="text-lg font-semibold">{station.name}</h3>
              <p>{station.address}</p>
              <span className={`badge mt-1 ${isActive ? "badge-success" : "badge-error"}`}>
                {isActive ? "Active" : "Inactive"}
              </span>
              {isSelected && isActive && (
                <p className="text-green-500 font-bold mt-1">✅ Selected</p>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
