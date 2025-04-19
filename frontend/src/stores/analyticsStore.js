import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAnalyticsStore = create((set) => ({
  userStats: { bookingStatus: {}, totalSpent: 0, totalEnergyConsumed: 0, totalRewards: 0, totalPenalty: 0 },
  managerStats: {},
  adminStats: {
    totalRevenue: 0,
    bookingStatusCount: {},
    paymentMethodStats: {},
    monthlyRevenue: [],
  },
  fetchUserAnalytics: async () => {
    try {
      const res = await axiosInstance.get("/analytics/user");
      console.log("Fetched user analytics:", res.data);
      set({ userStats: res.data });
    } catch (err) {
      console.error("Failed to load user analytics", err.message);
    }
  },
  
  fetchManagerAnalytics: async () => {
    try {
      const res = await axiosInstance.get("/analytics/manager");
      set({ managerStats: res.data });
    } catch (error) {
      console.error("Failed to fetch manager analytics", error);
    }
  },
  fetchAdminAnalytics: async () => {
    try {
      const res = await axiosInstance.get("/analytics/admin");
      set({ adminStats: res.data });
    } catch (err) {
      console.error("Failed to fetch admin analytics:", err);
    }
  },
}));

export default useAnalyticsStore;
