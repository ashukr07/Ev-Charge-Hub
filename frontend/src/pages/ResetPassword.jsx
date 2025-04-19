import {  useState } from "react";
import {  useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import LoadingSpinner from "../components/Spinner";

export default function ResetPassword() {
  const navigate = useNavigate();
  //const location = useLocation();
  const {resetPassword,loading} =useAuthStore()
  //const email = location.state?.email || ""; 
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword( otp, newPassword);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or error resetting password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-xl rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Reset Password</h2>
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="input input-bordered w-full mb-3 text-center"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="input input-bordered w-full mb-3 text-center"
          />
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading?(
              <LoadingSpinner />
            ):(
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
