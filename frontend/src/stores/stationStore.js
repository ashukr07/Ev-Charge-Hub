import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";


const useStationStore = create((set) => ({
  stations: [],
  bookings: [],
  unapprovedStations: [],
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
    set({ loading: true });
    try {
      const response = await axiosInstance.post(
        "/bookings/create", 
        bookingData,
        {withCredentials:true}
      );
      // console.log(bookingData)
      if(bookingData.paymentMethod==="online"){
        toast.success("Redirecting to payment gateway!");
      }else{
        toast.success("Booking successful with offline payment!");
      }
      set({ loading: false });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
      console.error("Booking error:", error);
      set({ loading: false });
      throw error;
    }
  },

  fetchManagerStations: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/station/manager-station");
      //console.log(response.data)
      set({ stations: response.data.station });
    } catch (error) {
      toast.error("Failed to load your stations");
    } finally {
      set({ loading: false });
    }
  },

  addStation: async (stationData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post("/station/add", stationData);
      set((state) => ({ stations: [...state.stations, response.data.station] }));
      toast.success("Station added successfully!");
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add station");
      console.error("Add station error:", error);
      
      throw error;
    } finally {
      set({ loading: false });
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

  fetchUnapprovedStations: async () => {
    try {
      const response = await axiosInstance.get("/station/unapproved");
      console.log(response)
      set({ unapprovedStations: response.data.station });
    } catch (error) {
      toast.error("Failed to fetch unapproved stations");
    }
  },
  
  approveStation: async (stationId) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/station/approve/${stationId}`);
      set((state) => ({
        unapprovedStations: state.unapprovedStations.filter((s) => s._id !== stationId),
      }));
      toast.success("Station approved");
    } catch (error) {
      toast.error("Failed to approve station");
    }finally{
      set({ loading: false });
    }
  },
  
  rejectStation: async (stationId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/station/reject/${stationId}`);
      console.log("Res ", res)
      set((state) => ({
        unapprovedStations: state.unapprovedStations.filter((s) => s._id !== stationId),
      }));
      toast.success("Station rejected");
    } catch (error) {
      toast.error("Failed to reject station");
    }finally{
      set({ loading: false });
    }
  },

  fetchStationBookings: async (stationId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/station/bookings/${stationId}`);
      set({ bookings: res.data.bookings });
    } catch (error) {
      toast.error("Failed to load station bookings");
    } finally {
      set({ loading: false });
    }
  },
  
  markBookingCompleted: async (bookingId) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/bookings/complete/${bookingId}`);
      toast.success("Booking marked as completed");
    } catch (error) {
      toast.error("Failed to complete booking");
    } finally {
      set({ loading: false });
    }
  },
  
  markBookingNoShow: async (bookingId) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/bookings/noshow/${bookingId}`);
      toast.success("Booking marked as no-show");
    } catch (error) {
      toast.error("Failed to mark as no-show");
    } finally {
      set({ loading: false });
    }
  },
  initiatePayment: async (bookingId, amount, penalty, reward) => {
    try {
      const res = await axiosInstance.post("/payments/create-checkout-session", {
        bookingId,
        amount,
        penalty,
        reward,
      });
  
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start payment");
    }
  },
  
  
}));

export default useStationStore;
