import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const StationForm = ({ station, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: station?.name || "",
    status: station?.status || "active",
    availableSlots: station?.availableSlots || "",
    totalSlots: station?.totalSlots || "",
    address: station?.address || "",
    latitude: station?.latitude || null,
    longitude: station?.longitude || null,
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Custom Marker Icon
  const customIcon = new L.Icon({
    iconUrl: "/evchargehub-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="text-xl font-bold">
          {station ? "Edit Station" : "Add New Station"}
        </h2>

        {/* Form Fields */}
        <div className="form-control">
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">Total Slots</label>
          <input
            type="number"
            name="totalSlots"
            value={formData.totalSlots}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">Available Slots</label>
          <input
            type="number"
            name="availableSlots"
            value={formData.availableSlots}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>

        {/* Map for Selecting Location */}
        <div className="mt-4">
          <MapContainer
            center={[formData.latitude || 28.6139, formData.longitude || 77.2090]}
            zoom={12}
            className="h-64 w-full rounded-md"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {formData.latitude && formData.longitude && (
              <Marker
                position={[formData.latitude, formData.longitude]}
                icon={customIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Save & Close Buttons */}
        <div className="modal-action">
          <button className="btn btn-primary" onClick={() => onSave(formData)}>
            Save
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
 export default StationForm