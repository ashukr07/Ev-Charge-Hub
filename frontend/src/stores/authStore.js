import { create } from "zustand";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";



export const useAuthStore = create((set) => ({
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  //accessToken: localStorage.getItem("accessToken") || null,

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null, accessToken: null });

      // Remove from localStorage
      //localStorage.removeItem("user");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  },

  login: async (email, password, role) => {
    try {
        console.log("Sending login request with:", { email, password, role });

        const response = await axios.post("/auth/login", { email, password, role });

        console.log("Login Response:", response);

        // If user is not verified, redirect to OTP page
        if (response.status === 403 || response.data.redirect === "/verify-otp") {
            console.log("User needs to verify OTP");
            toast.error("Please verify your account. OTP sent again.");
            return { redirect: "/verify-otp", email: response.data.email };
        }

        set({ user: response.data.user, accessToken: response.data.accessToken });

        // Store in localStorage
        //localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Login successful!");
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);

        // Handle 403 separately
        if (error.response?.status === 403) {
            toast.error("Please verify your account. OTP sent again.");
            return { redirect: "/verify-otp", email };
        }

        toast.error(error.response?.data?.message || "Login failed");
        return null;
    }
},


  signup: async (data) => {
    try {
      const response = await axios.post("/auth/signup", data);

      set({ user: response.data.user, accessToken: response.data.accessToken });

      // Store in localStorage
      //localStorage.setItem("user", JSON.stringify(response.data.user));
    

      toast.success("Signup successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Signup failed");
      console.error("API Error:", error.response?.data);

    }
  },

  verifyOTP: async (email, otp) => {
    try {
      await axios.post("/auth/verify-otp", { email, otp });
      toast.success("OTP verified successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error.response?.data || "OTP verification failed";
    }
  },

  resendOTP: async (email) => {
    try {
      await axios.post("/auth/resend-otp", { email });
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
      throw error.response?.data || "Failed to resend OTP";
    }
  },
  changePassword: async (oldPassword, newPassword,confirmPassword) => {
    try {
      await axios.put("/auth/change-password", { oldPassword, newPassword,confirmPassword });
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      toast.error("Failed to change password");
      throw error.response?.data || "Failed to change password";

    }
  },

  forgotPassword : async (email) => {
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email! Enter it to reset your password.");
    } catch (error) {
      toast.error("Failed to send OTP");  
      throw error.response?.data || "Failed to send OTP";

    }
  },
  resetPassword: async ( otp, newPassword) => {
    try {
      console.log("Sending reset password request with:", otp)
      await axios.put("/auth/reset-password", { otp, newPassword });
      toast.success("Password reset successfully! Login with new password.");
      return true;
    } catch (error) {
      toast.error("Invalid OTP or error resetting password.");
      throw error.response?.data || "Invalid OTP or error resetting password"
  }
},
}));
