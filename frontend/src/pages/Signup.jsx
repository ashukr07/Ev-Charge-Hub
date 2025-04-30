import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/Spinner.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordChecks = {
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const isPasswordValid =
    Object.values(passwordChecks).every(Boolean) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
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
      <div className="bg-neutral shadow-xl rounded-lg p-8 w-full max-w-md">
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
            className="input input-bordered w-full mb-1"
          />

          {/* Password Requirements - only show when user starts typing */}
          {formData.password && (
            <div className="text-sm text-left pl-1 mb-3 space-y-1">
              <p className={passwordChecks.hasUppercase ? "text-green-500" : "text-red-500"}>
                {passwordChecks.hasUppercase ? "✅" : "❌"} At least 1 uppercase letter
              </p>
              <p className={passwordChecks.hasNumber ? "text-green-500" : "text-red-500"}>
                {passwordChecks.hasNumber ? "✅" : "❌"} At least 1 number
              </p>
              <p className={passwordChecks.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                {passwordChecks.hasSpecialChar ? "✅" : "❌"} At least 1 special character
              </p>
            </div>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input input-bordered w-full mb-1"
          />

          {/* Show match status below confirm password */}
          {formData.confirmPassword && (
            <p className={`text-sm pl-1 mb-3 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
              {passwordsMatch ? "✅ Passwords match" : "❌ Passwords do not match"}
            </p>
          )}

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
            disabled={!isPasswordValid || loading}
          >
            {loading ? <LoadingSpinner /> : "Signup"}
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="/login" className="text-secondary">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
}
