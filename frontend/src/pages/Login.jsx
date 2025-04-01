import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user", // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await login(formData.email, formData.password, formData.role);
  
      if (!response) {
        toast.error("Login failed. Please try again.");
        return;
      }

      console.log("Login Response:", response);

    if (response.redirect === "/verify-otp") {
      toast("Please verify your account. Redirecting...");
      navigate("/verify-otp", { state: { email: response.email } }); // ✅ Navigate to OTP page
      return;
    }
  
      setUser(response.user);
  
      if (!response.user.isVerified) {
        navigate("/verify-otp");
      } else {
        switch (response.user.role) {
          case "user":
            navigate("/booking-slot");
            break;
          case "manager":
            navigate("/manager-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed");
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="bg-neutral shadow-xl rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full mb-3"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
        <div className="text-center mt-3">
          <a href="/forgot-password" className="text-secondary">Forgot Password?</a>
        </div>
        <div className="text-center mt-3">
          <a href="/signup" className="text-secondary">Don't have an account? Sign up</a>
        </div>
      </div>
    </div>
  );
}
