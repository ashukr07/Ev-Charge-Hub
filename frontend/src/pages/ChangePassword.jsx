import { useState } from "react";
import { useAuthStore } from "../stores/authStore.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/Spinner.jsx";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword,loading } = useAuthStore(); // ✅ Get changePassword function from store
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      await changePassword(formData.oldPassword, formData.newPassword, formData.confirmPassword);
      toast.success("Password changed successfully! Please log in again.");
      
      // ✅ Redirect to login after password change
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
