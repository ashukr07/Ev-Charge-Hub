import { useState, useEffect, useMemo } from "react";
import useStationStore from "../stores/stationStore";
import MapComponent from "../components/MapComponent";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { usePaymentStore } from "../stores/paymentStore";
import { useAuthStore } from "../stores/authStore";
import LoadingSpinner from "../components/Spinner";

const stripePromise = loadStripe("pk_test_51RDAnCSHN1hi8HGoWUr3q1Iv0QGwv0A2fmLFCNuHAITOq6pCtSG3vkHsSRohyfb4vLSTZR2ePgIMJtd1XkNnfjqh00YyJXk0XA");

export default function BookingSlot() {
  const {
    stations,
    userLocation,
    fetchStations,
    detectUserLocation,
    selectedStation,
    setSelectedStation,
    createBooking,
    loading
  } = useStationStore();

  const { user } = useAuthStore();
  const { createStripeSession } = usePaymentStore();

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

  const memoizedMap = useMemo(
    () => (
      <MapComponent
        stations={stations}
        onSelect={setSelectedStation}
        userLocation={userLocation}
        selectedStation={selectedStation}
      />
    ),
    [stations, userLocation, selectedStation]
  );

  const handleBooking = async () => {
    const {
      date,
      startTime,
      currentBattery,
      targetBattery,
      vehicleCapacity,
      paymentMethod,
    } = bookingData;

    if (!selectedStation)
      return toast.error("Please select a charging station on the map.");
    if (
      !date ||
      !startTime ||
      currentBattery === "" ||
      targetBattery === "" ||
      !vehicleCapacity ||
      !paymentMethod
    )
      return toast.error("Please fill all fields.");

    const formattedStartTime = `${date}T${startTime}:00+05:30`;

    const finalBookingData = {
      stationId: selectedStation._id,
      startTime: formattedStartTime,
      currentBattery,
      targetBattery,
      vehicleCapacity,
      paymentMethod,
    };

    try {
      const { booking } = await createBooking(finalBookingData);
      console.log("Booking data: ", booking);

      if (paymentMethod === "offline") {
        return;
      }

      const breakdown = {
        baseAmount: booking.totalAmount - (booking.penaltyApplied || 0) + (booking.rewardDiscount || 0),
        penalty: booking.penaltyApplied || 0,
        rewards: booking.rewardDiscount || 0,
        total: booking.totalAmount,
      };
      console.log("breakdown: ", breakdown)

      const sessionId = await createStripeSession(
        booking._id,
        booking.totalAmount,
        user.email,
        breakdown
      );
      console.log("session id: ",sessionId)

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Booking failed.");
    }
  };

  const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 5);

const formatDate = (date) => date.toISOString().split("T")[0];

const minDateStr = formatDate(today);
const maxDateStr = formatDate(maxDate);


  return (
    <div className="min-h-screen w-full p-5 bg-base-100">
      <h2 className="text-3xl font-bold text-primary text-center">Book a Charging Slot</h2>
      {loading ? (
        <LoadingSpinner text="Booking in progress.." />
      ) : ( 
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Map */}
        <div className="h-[500px] z-0">{memoizedMap}</div>

        {/* Form */}
        <div className="space-y-4 bg-neutral p-6 rounded-lg shadow-lg">
          <label className="block text-secondary font-semibold">Select Date</label>
          <input
  type="date"
  className="input input-bordered w-full"
  value={bookingData.date}
  min={minDateStr}
  max={maxDateStr}
  onChange={(e) => {
    const selectedDate = new Date(e.target.value);
    const selectedDateOnly = new Date(selectedDate.toDateString());
    const todayOnly = new Date(today.toDateString());
    const maxDateOnly = new Date(maxDate.toDateString());

    if (selectedDateOnly < todayOnly || selectedDateOnly > maxDateOnly) {
      toast.error("Please select a date within the next 5 days.");
      return;
    }
    setBookingData({ ...bookingData, date: e.target.value });
  }}
/>
<p className="text-xs text-yellow-500">
  * You can book only for the next 5 days.
</p>
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
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                currentBattery: e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value))),
              })
            }
          />

          <label className="block text-secondary font-semibold">Target SoC (%)</label>
          <input
            type="number"
            placeholder="Enter Target SoC (0-100%)"
            className="input input-bordered w-full"
            value={bookingData.targetBattery}
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                targetBattery: e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value))),
              })
            }
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

          <button onClick={handleBooking} className="btn btn-primary w-full">
            Book Now
          </button>
        </div>
      </div>
        </>

      )

      }
      
    </div>
  );
}
