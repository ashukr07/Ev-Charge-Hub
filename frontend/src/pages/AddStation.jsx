import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStationStore from "../stores/stationStore";
import MapSelector from "../components/MapSelector";
import toast from "react-hot-toast";

export default function AddStation() {
  const { addStation } = useStationStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    totalSlots: "",
    description: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.error("Please select a location on the map.");
      return;
    }
    await addStation(formData);
    toast.success("Station added successfully!");
    navigate("/manager-dashboard");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-primary mb-4">Add New Charging Station</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Station Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered w-full"
            />

            <input
              type="number"
              placeholder="Total Slots"
              value={formData.totalSlots}
              onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
              className="input input-bordered w-full"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea textarea-bordered w-full"
            />

            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input input-bordered w-full"
            />

            <button type="submit" className="btn btn-primary w-full">
              Add Station
            </button>
          </form>
        </div>

        {/* Right Side - Map */}
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold mb-2">Select Location</h3>
          <MapSelector onLocationSelect={handleLocationSelect} />
        </div>
      </div>
    </div>
  );
}
