import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export const usePaymentStore = create((set) => ({
  createStripeSession: async (bookingId, amount, email, breakdown) => {
    try {
        console.log("amount", typeof(amount));
      const response = await axiosInstance.post("/payment/create-checkout-session", {
        bookingId,
        amount,
        email,
        breakdown, // { baseAmount, penalty, rewards, total }
      });

      return response.data.sessionId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Stripe session");
      throw error;
    }
  },

  handleStripeSuccess: async () => {
    toast.success("Payment successful! Booking confirmed.");
  },

  handleStripeFailure: async () => {
    toast.error("Payment failed or canceled. Booking has been removed.");
  },
}));
