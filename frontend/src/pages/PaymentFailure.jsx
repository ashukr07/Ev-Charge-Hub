import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../lib/axios";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const bookingId = new URLSearchParams(location.search).get("bookingId");

    if (bookingId) {
      axios.post("/payment/cancel-payment", { bookingId });
    }

    const timer = setTimeout(() => {
      navigate("/booking-slot");
    }, 10000); // Redirect in 10 seconds

    return () => clearTimeout(timer); // Cleanup
  }, []);

  const handleRetry = () => {
    navigate("/booking-slot");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6 text-center">
      <img
        src="payment-failed.png" // Replace with your actual image path
        alt="Payment Failed"
        className="w-48 h-48 mb-6 animate-bounce"
      />
      <h2 className="text-3xl font-bold text-error mb-3">❌ Payment Failed</h2>
      <p className="text-lg text-base-content mb-2">
        Something went wrong with your payment.
      </p>
      <p className="text-md text-gray-500 mb-6">
        Your booking has been automatically canceled.
      </p>
      <button className="btn btn-error text-white" onClick={handleRetry}>
        Try Booking Again
      </button>
      <p className="mt-4 text-sm text-gray-400">You will be redirected in 10 seconds...</p>
    </div>
  );
}
