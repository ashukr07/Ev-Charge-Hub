import { useEffect } from "react";
import useStationStore from "../stores/stationStore";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router-dom";
import { Loader, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const {
    unapprovedStations,
    fetchUnapprovedStations,
    approveStation,
    rejectStation,
    loading,
  } = useStationStore();

  useEffect(() => {
    fetchUnapprovedStations();
  }, []);

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      {/* Drawer toggle button for small screens */}
      <div className="drawer-content flex flex-col p-6">
        <div className="lg:hidden mb-4">
          <label
            htmlFor="admin-drawer"
            className="inline-flex items-center gap-2 p-2 bg-base-100 rounded-full shadow cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary">Open Sidebar</span>
          </label>
        </div>

        {/* Main Content */}
        <h2 className="text-3xl font-bold text-primary mb-6">Unapproved Stations</h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedStations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No unapproved stations found.
                  </td>
                </tr>
              ) : (
                unapprovedStations.map((station) => (
                  <tr key={station._id}>
                    <td>{station.name}</td>
                    <td>{station.address}</td>
                    <td>{station.totalSlots}</td>
                    <td className="space-x-2">
                      {loading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approveStation(station._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => rejectStation(station._id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side z-40">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
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
          <Link to="/admin/analytics" className="btn btn-accent mt-4">
          📈 View Analytics
          </Link>
        </aside>
      </div>
    </div>
  );
}
