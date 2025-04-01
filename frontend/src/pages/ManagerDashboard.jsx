import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import useStationStore from "../stores/stationStore";
import { Link, useNavigate } from "react-router-dom";
import StationCard from "../components/StationCard";

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const { stations, fetchManagerStations } = useStationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagerStations();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/4 bg-secondary text-white p-6 flex flex-col gap-4">
        <div className="avatar avatar-placeholder gap-4">
          <div className="ring-base-100 ring-offset-base-100 ring ring-offset-2 bg-neutral text-neutral-content w-24 rounded-full">
            <span className="text-3xl">{user?.name[0]}</span>
          </div>
          <div>{user?.name}</div>
        </div>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <Link to="/change-password" className="btn btn-accent mt-4">
          Change Password
        </Link>
      </aside>

      {/* Main Section */}
      <main className="w-3/4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-primary">Your Charging Stations</h2>
          {/* Redirect to Add Station Page */}
          <button className="btn btn-primary" onClick={() => navigate("/station-details")}>
            Add New Station
          </button>
        </div>

        {stations.length === 0 ? (
          <div className="alert alert-warning mt-4">No stations assigned to you.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {stations.map((station) => (
              <StationCard key={station._id} station={station} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
