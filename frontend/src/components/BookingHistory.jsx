import { useEffect } from "react";
import useUserStore from "../stores/userStore";
import { format } from "date-fns";

export default function BookingHistory() {
  const { bookingHistory, getUserBookings } = useUserStore();

  useEffect(() => {
    getUserBookings();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Booking History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Date</th>
              <th>Start Time</th>
              <th>Price (₹)</th>
              <th>Status</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {bookingHistory.map((b) => (
              <tr key={b._id}>
                <td>{format(new Date(b.startTime), "dd MMM yyyy")}</td>
                <td>{format(new Date(b.startTime), "hh:mm a")}</td>
                <td>₹{b.totalAmount}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className="capitalize">{b.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper to color badges
function getStatusColor(status) {
    console.log("status",status)
  switch (status) {
    case "completed":
      return "success";
    case "no-show":
      return "warning";
    case "canceled":
      return "error";
    case "booked":
      return "info";
    default:
      return "neutral";
  }
}
