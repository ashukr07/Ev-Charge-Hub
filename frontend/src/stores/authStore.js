import { create } from "zustand";
import axios from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  //user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  user: null,
  accessToken: null,
  checkingAuth: true,
  loading: false,
  //accessToken: localStorage.getItem("accessToken") || null,

  setUser: (user) => {
    set({ user });
    //localStorage.setItem("user", JSON.stringify(user));
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post("/auth/logout");
      set({ user: null, accessToken: null, loading: false });

      // Remove from localStorage
      //localStorage.removeItem("user");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
      set({loading: false});
    }
  },

  login: async (email, password, role) => {
    set({ loading: true });
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
        console.log("User data:", response.data.user);
        console.log("Access token:", response.data.accessToken);
        set({ user: response.data.user, accessToken: response.data.accessToken,loading: false });

        toast.success("Login successful!");
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            toast.error("Please verify your account. OTP sent again.");
            return { redirect: "/verify-otp", email };
        }

        toast.error(error.response?.data?.message || "Login failed");
        set({loading: false});
        return null;
    }
},


  signup: async (data) => {
    set({ loading: true });
    try {
      const response = await axios.post("/auth/signup", data);

      set({ user: response.data.user, accessToken: response.data.accessToken,loading: false });

      toast.success("Signup successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Signup failed");
      console.error("API Error:", error.response?.data);
      set({loading: false});
    }
  },

  verifyOTP: async (email, otp) => {
    set({ loading: true });
    try {
      await axios.post("/auth/verify-otp", { email, otp });
      toast.success("OTP verified successfully! Redirecting...");
      set({ loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      set({ loading: false });
      throw error.response?.data || "OTP verification failed";

    }
  },

  resendOTP: async (email) => {
    set({ loading: true });
    try {
      await axios.post("/auth/resend-otp", { email });
      toast.success("OTP resent successfully");
      set({ loading: false });
    } catch (error) {
      toast.error("Failed to resend OTP");
      set({ loading: false });
      throw error.response?.data || "Failed to resend OTP";
    }
  },
  changePassword: async (oldPassword, newPassword,confirmPassword) => {
    set({ loading: true });
    try {
      await axios.put("/auth/change-password", { oldPassword, newPassword,confirmPassword });
      
      set({ loading: false });
      return true;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data || "Failed to change password";

    }
  },

  forgotPassword : async (email) => {
    set({ loading: true });
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email! Enter it to reset your password.");
      set({ loading: false });
    } catch (error) {
      toast.error("Failed to send OTP");  
      set({ loading: false });
      throw error.response?.data || "Failed to send OTP";

    }
  },
  resetPassword: async ( otp, newPassword) => {
    set({ loading: true });
    try {
      console.log("Sending reset password request with:", otp)
      await axios.put("/auth/reset-password", { otp, newPassword });
      toast.success("Password reset successfully! Login with new password.");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error("Invalid OTP or error resetting password.");
      set({ loading: false });
      throw error.response?.data || "Invalid OTP or error resetting password"
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false })
    } catch (error) {
      //toast.error("Failed to check authentication status");
      console.error("Failed to check authentication status:", error);
      set({ user: null, checkingAuth: false });
    }
  }

}));
