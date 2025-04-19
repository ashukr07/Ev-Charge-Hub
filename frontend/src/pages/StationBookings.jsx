import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useStationStore from "../stores/stationStore";
import LoadingSpinner from "../components/Spinner";
import { Loader } from "lucide-react";

export default function StationBookings() {
  const { stationId } = useParams();
  const {
    bookings,
    fetchStationBookings,
    markBookingCompleted,
    markBookingNoShow,
    loading
  } = useStationStore();

  useEffect(() => {
    fetchStationBookings(stationId);
  }, [stationId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Station Bookings</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Date</th>
              <th>Charge</th>
              <th>Price (in ₹)</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(
              (b) => (
                console.log(b),
                (
                  <tr key={b._id}>
                    <td>{b.user?.name || "N/A"}</td>
                    <td>{b.user?.email || "N/A"}</td>
                    <td>{new Date(b.startTime).toLocaleString()}</td>
                    <td>{b.energyConsumed} kWh</td>
                    <td>{b.totalAmount} ₹</td>
                    <td>
                    <span className={`badge badge-${b.paymentMethod === "online" ? "success" : "warning"}`}>
                      {b.paymentMethod}
                    </span>
                    </td>
                    <td>{b.status}</td>
                    <td className="flex gap-2">
                      {loading ? (
                          <Loader className="animate-spin" />
                        
                      ) : (
                        <>
                        <button
                        className="btn btn-sm btn-success"
                        disabled={b.status !== "booked"}
                        onClick={async () => {
                          await markBookingCompleted(b._id);
                          fetchStationBookings(stationId); // Refresh after action
                        }}
                      >
                        Complete
                      </button>

                      <button
                        className="btn btn-sm btn-error"
                        disabled={b.status !== "booked"}
                        onClick={async () => {
                          await markBookingNoShow(b._id);
                          fetchStationBookings(stationId); // Refresh after action
                        }}
                      >
                        No-Show
                      </button>
                        </>
                      )
                    }
                      
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
