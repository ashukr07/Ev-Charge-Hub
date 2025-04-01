import { useNavigate } from "react-router-dom";
import useStationStore from "../stores/stationStore";

const StationCard = ({ station }) => {
  const navigate = useNavigate();
  const { setSelectedStation } = useStationStore();

  const handleEdit = () => {
    setSelectedStation(station); // Store selected station in Zustand
    navigate(`/edit-station/${station._id}`); // Navigate to edit page
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl p-4 cursor-pointer" onClick={handleEdit}>
      <h3 className="text-xl font-bold">{station.name}</h3>
      <p><strong>Status:</strong> <span className={`badge ${station.status === "active" ? "badge-success" : "badge-error"}`}>{station.status}</span></p>
      <p><strong>Slots:</strong> {station.availableSlots} / {station.totalSlots}</p>
      <p><strong>Location:</strong> {station.address}</p>
    </div>
  );
};

export default StationCard;
