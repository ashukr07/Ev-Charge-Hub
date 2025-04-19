import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  const sessionId = new URLSearchParams(location.search).get("session_id");
  console.log("sessionId", sessionId);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axiosInstance.get(`/payment/session-details/${sessionId}`);
        const booking = res.data.booking;
  
        // ✅ Mark booking as paid manually
        await axiosInstance.put(`/payment/mark-paid`,{
          bookingId: booking._id,
          sessionId
        });
        
        setBooking(booking);
      } catch (error) {
        toast.error("Failed to fetch booking details.");
        navigate("/");
      }
    };
  
    if (sessionId) fetchBooking();
  }, [sessionId]);

  if (!booking) {
    return <div className="p-6 text-center">Loading booking details...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-success mb-4 text-center">✅ Payment Successful!</h2>
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Booking Summary</h3>
        <ul className="space-y-2">
          <li><strong>Station:</strong> {booking.station?.name || "N/A"}</li>
          <li><strong>Date & Time:</strong> {new Date(booking.startTime).toLocaleString()}</li>
          <li><strong>Energy Consumed:</strong> {booking.energyConsumed} kWh</li>
          <li><strong>Base Price:</strong> ₹{booking.baseAmount}</li>
          <li><strong>Penalty Applied:</strong> ₹{booking.penaltyApplied} {booking.penaltyApplied > 0 && <span className="badge badge-error ml-2">Penalty</span>}</li>
          <li><strong>Reward Discount:</strong> ₹{booking.rewardDiscount} {booking.rewardDiscount > 0 && <span className="badge badge-success ml-2">Reward</span>}</li>
          <li><strong>Total Paid:</strong> <span className="text-primary font-bold">₹{booking.totalAmount}</span></li>
        </ul>
        <div className="mt-6 text-center">
          <button className="btn btn-primary" onClick={() => navigate("/user-dashboard")}>Go to Dashboard</button>
        </div>
      </div>
    </div>
  );
}