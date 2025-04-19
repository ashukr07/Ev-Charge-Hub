import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStationStore from "../stores/stationStore";
import toast from "react-hot-toast";

export default function EditStation() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { stations, updateStation } = useStationStore();
  const station = stations.find((s) => s._id === stationId);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    totalSlots: 0,
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name,
        address: station.address,
        totalSlots: station.totalSlots,
        description: station.description,
        status: station.status,
      });
    }
  }, [station]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStation(stationId, formData);
      toast.success("Station updated successfully!");
      navigate("/manager-dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-base-100 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-primary mb-4">Edit Station</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input input-bordered w-full" />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input input-bordered w-full" />
        <input name="totalSlots" type="number" value={formData.totalSlots} onChange={handleChange} placeholder="Total Slots" className="input input-bordered w-full" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="textarea textarea-bordered w-full"></textarea>
        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="btn btn-primary w-full">Save Changes</button>
      </form>
    </div>
  );
}
