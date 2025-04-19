import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore.js";
import useUserStore from "../stores/userStore.js";
import BookingCard from "../components/BookingCard";
import { Link } from "react-router-dom";
import UserAnalytics from "../components/UserAnalytics.jsx";
import { ChevronRight } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { upcomingBookings, getUserBookings } = useUserStore();

  useEffect(() => {
    getUserBookings();
  }, []);

  return (
    <div className="drawer lg:drawer-open min-h-screen">
     

      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col p-6">
      <div className="lg:hidden mb-4">
    <label
      htmlFor="dashboard-drawer"
      className="inline-flex items-center gap-2 p-2 bg-base-100 rounded-full shadow cursor-pointer"
    >
      <ChevronRight className="w-5 h-5 text-primary" />
      <span className="text-sm text-primary">Open Sidebar</span>
    </label>
  </div>
        <UserAnalytics />
        <h2 className="text-2xl font-bold mb-4 text-primary">Upcoming Bookings</h2>
        {upcomingBookings.length === 0 ? (
          <div className="alert alert-info">No upcoming bookings</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
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
          <Link to="/booking-history" className="btn btn-accent mt-4">
            Booking History
          </Link>
        </aside>
      </div>
    </div>
  );
}
