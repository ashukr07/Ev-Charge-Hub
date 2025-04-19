import { useNavigate } from "react-router-dom";
import useStationStore from "../stores/stationStore";

const StationCard = ({ station }) => {
  const navigate = useNavigate();
  const { setSelectedStation, fetchStationBookings } = useStationStore();

  const handleEdit = () => {
    setSelectedStation(station); // Store selected station in Zustand
    navigate(`/edit-station/${station._id}`); // Navigate to edit page
  };

  const handleManageBookings = async () => {
    await fetchStationBookings(station._id);
    navigate(`/station/${station._id}/bookings`);
  };

  return (
    <div className="card w-full bg-neutral shadow-xl p-4">
      <h3 className="text-xl font-bold text-primary mb-2">{station.name}</h3>
      <p >
        <strong>Status: </strong> 
        <span className={`badge ${!station.isApproved ? "badge-warning" : station.status === "active" ? "badge-success" : "badge-error"}`}>
          {!station.isApproved ? "Pending Approval" : station.status}
        </span>
      </p>
      <p><strong>Slots:</strong> {station.totalSlots}</p>
      <p><strong>Location:</strong> {station.address}</p>
      <div className="flex justify-between mt-4">
        <button onClick={handleEdit} className="btn btn-outline btn-primary btn-sm">Edit Details</button>
        <button onClick={handleManageBookings} className="btn btn-outline btn-accent btn-sm">Manage Bookings</button>
      </div>
    </div>
  );
};

export default StationCard;
