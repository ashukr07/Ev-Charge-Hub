// components/BookingCard.jsx
import { format } from "date-fns";
import useUserStore from "../stores/userStore.js";
import LoadingSpinner from "./Spinner.jsx";

export default function BookingCard({ booking }) {
  const { cancelBooking,loading } = useUserStore();

  const startTime = new Date(booking.startTime);
  const canCancel = new Date() < new Date(startTime.getTime() - 2 * 60 * 60 * 1000);

  return (
    <div className="card bg-neutral shadow-md p-4 border border-green-500">
      <h3 className="text-xl font-semibold">{booking.station.name}</h3>
      <p className="text-sm text-neutral-400">{format(startTime, "dd MMM yyyy, h:mm a")}</p>
      <p className="text-lg">🔋 {booking.currentBattery}% → {booking.targetBattery}%</p>
      <p className="text-lg">💸 ₹{booking.totalAmount} via {booking.paymentMethod}</p>

      <button
        className="btn btn-warning mt-2"
        onClick={() => cancelBooking(booking._id)}
        disabled={!canCancel||loading}
      >
        {
          loading? (
            <LoadingSpinner />
          ):(
            "Cancel Booking"
          )
        }
      </button>
    </div>
  );
}
