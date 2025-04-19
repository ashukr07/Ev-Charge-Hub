import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../lib/axios";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const bookingId = new URLSearchParams(location.search).get("bookingId");
    console.log("bookingId", bookingId);

    // Delete booking on cancel
    if (bookingId) {
      axios.post("/payment/cancel-payment", { bookingId });
    }

    setTimeout(() => {
      navigate("/booking-slot");
    }, 5000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-4xl font-bold text-red-500 mb-4">❌ Payment Failed</h2>
      <p className="text-lg text-neutral mb-4">Please try to book again</p>
      <p className="text-lg text-neutral">Your booking has been canceled.</p>
    </div>
  );
}
