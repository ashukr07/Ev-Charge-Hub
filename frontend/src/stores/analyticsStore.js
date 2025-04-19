import { create } from 'zustand';
import axios from '../lib/axios';

const useAnalyticsStore = create((set) => ({
  userStats: null,
  managerStats: null,

  fetchUserAnalytics: async () => {
    const res = await axios.get('/analytics/user');
    set({ userStats: res.data });
  },

  fetchManagerAnalytics: async () => {
    const res = await axios.get('/analytics/manager');
    set({ managerStats: res.data });
  },
}));

export default useAnalyticsStore;