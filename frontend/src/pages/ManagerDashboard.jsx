import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import useStationStore from "../stores/stationStore";
import { Link, useNavigate } from "react-router-dom";
import StationCard from "../components/StationCard";
import { ChevronRight } from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const { stations, fetchManagerStations } = useStationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagerStations();
  }, []);

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      {/* Toggle Button for small screens */}
      <div className="drawer-content flex flex-col p-6">
        {/* Drawer Toggle Button (Below Navbar) */}
        <div className="lg:hidden mb-4">
          <label
            htmlFor="manager-drawer"
            className="inline-flex items-center gap-2 p-2 bg-base-100 rounded-full shadow cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary">Open Sidebar</span>
          </label>

        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-primary">Your Charging Stations</h2>
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
      </div>

      {/* Sidebar Drawer */}
      <input id="manager-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side z-40">
        <label htmlFor="manager-drawer" className="drawer-overlay"></label>
        <aside className="w-64 bg-secondary text-white p-6 h-full flex flex-col justify-center items-center gap-4">
          <div className="avatar avatar-placeholder gap-4 items-center justify-center">
            <div className="ring-base-100 ring-offset-base-100 ring ring-offset-2 bg-neutral text-neutral-content w-24 rounded-full">
              <span className="text-3xl">{user?.name[0]}</span>
            </div>
          </div>
          <div>{user?.name}</div>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <Link to="/change-password" className="btn btn-accent mt-4">
            Change Password
          </Link>
          <Link to="/manager/analytics" className="btn btn-accent mt-4">
            📊View Analytics
          </Link>
        </aside>
      </div>
    </div>
  );
}
