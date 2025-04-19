import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import { Loader } from "lucide-react";

export default function ForgotPassword() {
  const {forgotPassword ,loading} = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email)
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered w-full mb-3"
          />
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading?(
              <Loader className="animate-spin" />
            ):(
              "Send OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
