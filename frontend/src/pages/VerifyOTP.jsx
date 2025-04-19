import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Import useLocation
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore.js";
import LoadingSpinner from "../components/Spinner.jsx";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verifyOTP, resendOTP,loading } = useAuthStore();
  const [otp, setOtp] = useState("");

  // ✅ Get email from user or from location state
  const email = user?.email || location.state?.email;

  if (!email) {
    toast.error("No email found. Please log in again.");
    navigate("/login");
    return null; // Prevent rendering
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(email, otp);
      // ✅ Navigate to login after OTP verification
      navigate("/login");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email);
    } catch (error) {
      console.error("Resend OTP failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Verify OTP</h2>
        <p className="text-center text-base-600 mb-3">Enter the OTP sent to {email}</p>
        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="input input-bordered w-full mb-3 text-center"
          />
          <button type="submit" className="btn btn-primary w-full">Verify OTP</button>
        </form>
        <button 
          onClick={handleResendOTP} 
          className="btn btn-secondary w-full mt-3"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            "Resend OTP"
          )}
        </button>
      </div>
    </div>
  );
}
