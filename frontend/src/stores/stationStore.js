import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";


const useStationStore = create((set) => ({
  stations: [],
  userLocation: { latitude: 28.6139, longitude: 77.2090, landmark: "📍 India Gate, New Delhi" }, // Default location
  selectedStation: null,
  loading: false,

  fetchStations: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/station/approved");
      console.log("Fetched stations:", response.data.stations);
      set({ stations: response.data.stations });
    } catch (error) {
      toast.error("Failed to load stations");
    } finally {
      set({ loading: false });
    }
  },

  detectUserLocation: async () => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            userLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              landmark: "📍 You are here",
            },
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not detect location, using default.");
        }
      );
    } catch (error) {
      toast.error("Error detecting location");
    }
  },

  setSelectedStation: (station) => set({ selectedStation: station }),

  createBooking: async (bookingData) => {
    try {
      const response = await axiosInstance.post(
        "/bookings/create", 
        bookingData,
        {withCredentials:true}
      );
      toast.success("Booking successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
      throw error;
    }
  },

  fetchManagerStations: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/station/manager-station");
      console.log(response.data)
      set({ stations: response.data.station });
    } catch (error) {
      toast.error("Failed to load your stations");
    } finally {
      set({ loading: false });
    }
  },

  addStation: async (stationData) => {
    try {
      const response = await axiosInstance.post("/station/add", stationData);
      set((state) => ({ stations: [...state.stations, response.data.station] }));
      toast.success("Station added successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add station");
      throw error;
    }
  },
  updateStation:  async(stationId,updatedData) => {
    try {
      const response = await axiosInstance.put(`/station/${stationId}/update`, updatedData);
      set((state) =>({
        stations: state.stations.map((station) =>
          station._id === stationId ? response.data.station : station
        )
      }))
      toast.success("Station updated successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update station");
      throw error;
    }
  },
  
}));

export default useStationStore;
