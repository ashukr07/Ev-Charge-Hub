import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/Spinner.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signup,loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      await signup(formData);
      toast.success("Signup successful! Please verify your OTP.");
      navigate("/verify-otp");
    } catch (error) {
      toast.error(error.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-xl rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-3"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full mb-3"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              "Signup"
            )}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/login" className="text-secondary">Already have an account! Login</a>
        </div>
      </div>
    </div>
  );
}
