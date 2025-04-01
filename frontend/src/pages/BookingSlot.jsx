import { useState, useEffect, useMemo } from "react";
import useStationStore from "../stores/stationStore";
import MapComponent from "../components/MapComponent";
import toast from "react-hot-toast";

export default function BookingSlot() {
  const { 
    stations, 
    userLocation, 
    fetchStations, 
    detectUserLocation, 
    selectedStation, 
    setSelectedStation, 
    createBooking 
  } = useStationStore();
  
  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    currentBattery: "",
    targetBattery: "",
    vehicleCapacity: "",
    paymentMethod: "",
  });

  useEffect(() => {
    fetchStations();
    detectUserLocation();
  }, []);

  // Memoize the map component to prevent reloading on form change
  const memoizedMap = useMemo(() => (
    <MapComponent 
      stations={stations} 
      onSelect={setSelectedStation} 
      userLocation={userLocation} 
      selectedStation={selectedStation}
    />
  ), [stations, userLocation, selectedStation]);

  const handleBooking = async () => {
    if (!selectedStation) {
      return toast.error("Please select a charging station on the map.");
    }
  
    if (
      !bookingData.date ||
      !bookingData.startTime ||
      bookingData.currentBattery === "" ||
      bookingData.targetBattery === "" ||
      !bookingData.vehicleCapacity ||
      !bookingData.paymentMethod
    ) {
      return toast.error("Please fill all fields.");
    }
  
    // Restrict currentSoC and targetSoC to range 0-100 if not empty
    const currentBattery = bookingData.currentBattery === "" 
      ? "" 
      : Math.max(0, Math.min(100, Number(bookingData.currentBattery)));
    const targetBattery = bookingData.targetBattery === "" 
      ? "" 
      : Math.max(0, Math.min(100, Number(bookingData.targetBattery)));
  
    // Combine date and time with IST offset
    const localDateTimeString = `${bookingData.date}T${bookingData.startTime}:00+05:30`;
  
    const finalBookingData = {
      stationId: selectedStation._id,
      startTime: localDateTimeString,
      currentBattery,
      targetBattery,
      vehicleCapacity: bookingData.vehicleCapacity,
      paymentMethod: bookingData.paymentMethod,
    };
  
    try {
      await createBooking(finalBookingData);
      toast.success("Booking successful!");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(error.response?.data?.message || "Booking failed. Please try again.");
    }
  };
  
  return (
    <div className="min-h-screen w-full p-5 bg-base-100">
      <h2 className="text-3xl font-bold text-primary text-center">Book a Charging Slot</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Map Section */}
        <div className="h-[500px] z-0">
          {memoizedMap}
        </div>
  
        {/* Booking Form */}
        <div className="space-y-4 bg-neutral p-6 rounded-lg shadow-lg">
          <label className="block text-secondary font-semibold">Select Date</label>
          <input 
            type="date" 
            className="input input-bordered w-full"
            value={bookingData.date} 
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
          />
  
          <label className="block text-secondary font-semibold">Select Time</label>
          <input 
            type="time" 
            className="input input-bordered w-full"
            value={bookingData.startTime} 
            onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
          />
  
          <label className="block text-secondary font-semibold">Current SoC (%)</label>
          <input 
            type="number" 
            placeholder="Enter Current SoC (0-100%)"
            className="input input-bordered w-full"
            value={bookingData.currentBattery}
            onChange={(e) => setBookingData({ 
              ...bookingData, 
              currentBattery: e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value)))
            })}
          />
  
          <label className="block text-secondary font-semibold">Target SoC (%)</label>
          <input 
            type="number" 
            placeholder="Enter Target SoC (0-100%)"
            className="input input-bordered w-full"
            value={bookingData.targetBattery}
            onChange={(e) => setBookingData({ 
              ...bookingData, 
              targetBattery: e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value)))
            })}
          />
  
          <label className="block text-secondary font-semibold">Vehicle Capacity (kWh)</label>
          <input 
            type="number" 
            placeholder="Enter Vehicle Capacity"
            className="input input-bordered w-full"
            value={bookingData.vehicleCapacity}
            onChange={(e) => setBookingData({ ...bookingData, vehicleCapacity: e.target.value })}
          />
  
          <label className="block text-secondary font-semibold">Payment Method</label>
          <select 
            className="select select-bordered w-full"
            value={bookingData.paymentMethod}
            onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
          >
            <option value="" disabled>Select Payment Method</option>
            <option value="online">Online Payment</option>
            <option value="offline">Offline Payment</option>
          </select>
  
          <button onClick={handleBooking} className="btn btn-primary w-full">Book Now</button>
        </div>
      </div>
    </div>
  );
}
