import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useUserStore = create((set) => ({
  upcomingBookings: [],
  bookingHistory: [],
  loading: false,

  // In stationStore.js or userStore.js
getUserBookings: async () => {
  set({ loading: true });
    try {
      const res = await axiosInstance.get("/bookings/user");
      console.log("Fetched user bookings:", res.data);
      set({
        upcomingBookings: res.data.upcoming,
        bookingHistory: res.data.history,
        loading: false,
      });
    } catch (error) {
      toast.error("Failed to fetch user bookings");
      console.error(error);
      set({ loading: false });
    }
  },
  

  cancelBooking: async (bookingId) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/bookings/cancel/${bookingId}`);
      toast.success("Booking cancelled and refund initiated.");
      set({ loading: false });
      // Refetch after cancel
      await useUserStore.getState().getUserBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
      console.error(error);
      set({ loading: false });
    }
  },
}));

export default useUserStore;