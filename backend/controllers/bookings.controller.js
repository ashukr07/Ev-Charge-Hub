import Booking from "../models/booking.model.js";
import Station from "../models/station.model.js";
import User from "../models/user.model.js";

// Function to check slot availability based on overlapping bookings
const checkAvailability = async (stationId, startTime, endTime) => {
  const overlappingBookings = await Booking.find({
    station: stationId,
    status: "booked",
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time check
    ],
  });

  return overlappingBookings.length; // Number of occupied slots
};

export const createBooking = async (req, res) => {
    try {
        const { stationId, startTime, currentBattery, targetBattery, vehicleCapacity, paymentMethod } = req.body;
        console.log("📥 Request Body:", req.body);

        // Step 1: Assume Frontend sends time in IST with proper offset (e.g., "2025-03-28T15:47:00+05:30")
        const startIST = new Date(startTime); 
        if (isNaN(startIST)) return res.status(400).json({ message: "Invalid start time" });
        console.log("⏳ Start Time (IST):", startIST.toString());

        // Define allowed booking window in IST
        const openingHour = 9;   // 9:00 AM IST
        const closingHour = 22;  // 10:00 PM IST

        // Extract hours and minutes from startIST
        const startHour = startIST.getHours();
        const startMinutes = startIST.getMinutes();
        console.log("⏳ Start Hour (IST):", startHour, "Minutes:", startMinutes);

        // Check that booking start time is within allowed hours (IST)
        if (startHour < openingHour || startHour >= closingHour) {
            return res.status(400).json({ message: "Booking must be between 9:00 AM and 10:00 PM IST." });
        }

        // Fetch station details
        const station = await Station.findById(stationId).select("totalSlots power");
        if (!station) return res.status(404).json({ message: "Station not found" });

        // Ensure start time is in the future
        const currentTime = new Date();
        if (startIST < currentTime) {
            return res.status(400).json({ message: "You cannot book a slot in the past." });
        }

        // Calculate estimated charging time
        const chargeTimeHours = (vehicleCapacity * (targetBattery - currentBattery)) / (100 * station.power);
        const chargeTimeMinutes = Math.ceil(chargeTimeHours * 60);
        console.log("🔋 Vehicle Capacity:", vehicleCapacity);
        console.log("⚡ Station Power:", station.power);
        console.log("⏳ Charge Time (minutes):", chargeTimeMinutes);

        // Calculate end time in IST
        const endIST = new Date(startIST.getTime() + chargeTimeMinutes * 60 * 1000);
        console.log("🔚 End Time (IST):", endIST.toString());

        // Extract end time components in IST
        const endHour = endIST.getHours();
        const endMinutes = endIST.getMinutes();
        console.log("🔚 End Hour (IST):", endHour, "Minutes:", endMinutes);
        console.log("🏪 Closing Hour (IST):", closingHour);

        // Ensure end time does not exceed 10:00 PM IST
        if (endHour > closingHour || (endHour === closingHour && endMinutes > 0)) {
            return res.status(400).json({
                message: "Booking cannot exceed closing time (10 PM IST).",
                debugInfo: {
                    startIST: startIST.toString(),
                    endIST: endIST.toString(),
                    closingTimeIST: `${closingHour}:00`,
                    endHour,
                    endMinutes
                }
            });
        }

        // Check available slots (using startIST and endIST directly)
        const bookedSlots = await checkAvailability(stationId, startIST, endIST);
        if (bookedSlots >= station.totalSlots) {
            return res.status(400).json({ message: "No available slots for the estimated charging time." });
        }

        // Calculate base charging cost
        const chargingRate = 5; // ₹5 per kWh
        const energyUsed = (vehicleCapacity * (targetBattery - currentBattery)) / 100;
        console.log("🔌 Energy Used:", energyUsed);
        let totalCost = energyUsed * chargingRate;

        // Apply pending penalty (if any)
        const user = await User.findById(req.user._id).select("pendingPenalty rewards");
        if (user.pendingPenalty > 0) {
            totalCost += user.pendingPenalty;
            user.pendingPenalty = 0;
            await user.save();
        }

        // Apply rewards (if available)
        if (user.rewards > 0) {
            totalCost -= user.rewards;
            user.rewards = 0;
            await user.save();
        }

        // Create the booking (store times as received, which are in IST)
        const newBooking = new Booking({
            station: stationId,
            user: req.user._id,
            startTime: startIST,
            endTime: endIST,
            currentBattery,
            targetBattery,
            energyConsumed: energyUsed,
            estimatedChargeTime: chargeTimeMinutes,
            paymentMethod,
            paymentStatus: "pending",
            totalAmount: totalCost
        });

        await newBooking.save();

        return res.status(201).json({
            message: "Booking confirmed!",
            booking: newBooking
        });

    } catch (error) {
        console.error("❌ Error in createBooking controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};






export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }
    // Ensure only the owner can cancel
    if (booking.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking" });
    }

    // Check if cancellation is allowed (must be before 2 hours of start time)
    const currentTime = new Date();
    const twoHoursBeforeStart = new Date(booking.startTime);
    twoHoursBeforeStart.setHours(twoHoursBeforeStart.getHours() - 2);
    console.log("Current Time: ", currentTime);
    console.log("Two Hours Before Start: ", twoHoursBeforeStart);

    if (currentTime > twoHoursBeforeStart) {
      return res
        .status(400)
        .json({
          message:
            "You can only cancel at least 2 hours before your booking starts.",
        });
    }

    // Update booking status
    booking.status = "canceled";
    await booking.save();

    return res.status(200).json({
      message: "Booking canceled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error in cancelBooking controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id; // Get logged-in user ID

    // Fetch bookings for the logged-in user, sorted by newest first
    const bookings = await Booking.find({ user: userId })
      .populate("station", "name location") // Populate station details
      .sort({ startTime: -1 }); // Sort in descending order (latest first)

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error in getUserBookings controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getManagerBookings = async (req, res) => {
  try {
    const managerId = req.user._id;
    // Find all stations managed by this manager
    const stations = await Station.find({ manager: managerId }).select(
      "_id name"
    );

    if (stations.length === 0) {
      return res
        .status(404)
        .json({ message: "No stations found under your management" });
    }

    // Extract station IDs
    const stationIds = stations.map((station) => station._id);

    // Fetch all bookings for these stations
    const bookings = await Booking.find({ station: { $in: stationIds } })
      .populate("user", "name email") // Populate user details
      .populate("station", "name location") // Populate station details
      .sort({ startTime: -1 }); // Sort by latest first

    return res.status(200).json({
      stations,
      bookings,
    });
  } catch (error) {
    console.error("Error in getManagerBookings controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const noShowBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("user");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Ensure the booking is still active
    if (booking.status !== "booked") {
      return res
        .status(400)
        .json({ message: "Only active bookings can be marked as no-show" });
    }

    // Apply No-Show Penalty (e.g., ₹50)
    const noShowPenalty = 50;
    const user = booking.user;

    // Store penalty in user model (to apply on next booking)
    user.pendingPenalty += noShowPenalty;
    await user.save();

    // Update booking status to "no-show"
    booking.status = "no-show";
    await booking.save();

    res
      .status(200)
      .json({
        message:
          "User marked as no-show. Penalty will be applied on the next booking.",
        booking,
      });
  } catch (error) {
    console.error("Error in noShowBooking controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Fetch the booking
    const booking = await Booking.findById(bookingId).populate("user");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    //console.log("Booking: ", booking);

    if (booking.status !== "booked") {
      return res
        .status(400)
        .json({ message: "Only active bookings can be marked as completed" });
    }

    const user = booking.user;
    let totalCost = booking.totalAmount; // Get pre-calculated cost from createBooking

    // 1️⃣ Apply Pending No-Show Penalty (if any)
    if (user.pendingPenalty > 0) {
      totalCost += user.pendingPenalty; // Add penalty to final cost
      user.pendingPenalty = 0; // Reset after applying
      await user.save({ validateBeforeSave: false });
    }

    // Ensure the total amount is not negative
    totalCost = Math.max(totalCost, 0);

    // 2️⃣ Mark Booking as Completed
    booking.status = "completed";
    booking.totalAmount = totalCost;
    await booking.save();

    // 3️⃣ Grant a Reward for Future Use
    const rewardAmount = 20; // Example: ₹20 discount for next booking
    user.rewards += rewardAmount;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Booking completed successfully. Reward granted!",
      totalCost,
      rewardAmount,
    });
  } catch (error) {
    console.error("Error in completeBooking controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};
