import Booking from "../models/booking.model.js";
import Station from "../models/station.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const {
      stationId,
      startTime,
      currentBattery,
      targetBattery,
      vehicleCapacity,
      paymentMethod,
    } = req.body;

    const startIST = new Date(startTime);
    if (isNaN(startIST)) {
      return res.status(400).json({ message: "Invalid start time" });
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
    const chargeTimeHours =
      (vehicleCapacity * (targetBattery - currentBattery)) / (100 * station.power);
    const chargeTimeMinutes = Math.ceil(chargeTimeHours * 60);
    const endIST = new Date(startIST.getTime() + chargeTimeMinutes * 60 * 1000);

    // Check available slots
    const bookedSlots = await checkAvailability(stationId, startIST, endIST);
    if (bookedSlots >= station.totalSlots) {
      return res.status(400).json({
        message: "No available slots for the estimated charging time.",
      });
    }

    // Calculate pricing
    const chargingRate = 5; // ₹5 per kWh
    const energyUsed = (vehicleCapacity * (targetBattery - currentBattery)) / 100;
    let baseAmount = energyUsed * chargingRate;
    let penaltyApplied = 0;
    let rewardDiscount = 0;
    let totalCost = baseAmount;

    // Apply penalties and rewards
    const user = await User.findById(req.user._id).select(
      "pendingPenalty rewards totalPenalties totalRewards"
    );

    if (user.pendingPenalty > 0) {
      penaltyApplied = user.pendingPenalty;
      totalCost += penaltyApplied;
      user.totalPenalties = (user.totalPenalties || 0) + penaltyApplied;
      user.pendingPenalty = 0;
    }

    if (user.rewards > 0) {
      rewardDiscount = user.rewards;
      totalCost -= rewardDiscount;
      user.totalRewards = (user.totalRewards || 0) + rewardDiscount;
      user.rewards = 0;
    }

    await user.save({ validateBeforeSave: false });

    // Save the booking
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
      baseAmount,
      penaltyApplied,
      rewardDiscount,
      totalAmount: totalCost,
    });

    await newBooking.save();

    // Auto-cancel after 10 minutes if unpaid
    setTimeout(async () => {
      const freshBooking = await Booking.findById(newBooking._id);
      if (
        freshBooking &&
        freshBooking.paymentMethod === "online" &&
        freshBooking.paymentStatus !== "paid"
      ) {
        await Booking.findByIdAndDelete(freshBooking._id);
        console.log(`🕒 Booking ${freshBooking._id} deleted due to non-payment within 10 minutes.`);
      }
    }, 10 * 60 * 1000);

    return res.status(201).json({
      message: "Booking confirmed!",
      booking: newBooking,
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

    const booking = await Booking.findById(bookingId)
                    .populate("user")
                    .populate({
                      path: "station",
                      populate: { path: "manager", select: "email name" }
  });
    console.log("Booking: ", booking);

    if (!booking) return res.status(400).json({ message: "Booking not found" });
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    const currentTime = new Date();
    const twoHoursBeforeStart = new Date(booking.startTime);
    twoHoursBeforeStart.setHours(twoHoursBeforeStart.getHours() - 2);

    if (currentTime > twoHoursBeforeStart) {
      return res.status(400).json({
        message: "You can only cancel at least 2 hours before your booking starts.",
      });
    }

    // If booking was online + paid → initiate refund
    if (booking.paymentMethod === "online" && booking.paymentStatus === "paid") {
      if (!booking.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found for this booking" });
      }

      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
      });
      console.log("refund ",refund)

      // ✅ Send refund email
      await sendEmail({
        to: booking.user.email,
        subject: "Booking Cancelled & Refunded",
        text: `
Hi ${booking.user.name},

Your booking at "${booking.station.name}" has been cancelled successfully.
💸 A refund of ₹${booking.totalAmount} has been initiated to your payment method.

Please allow 5-7 business days for the amount to reflect in your account.
If you have any questions, feel free to reach out to us or the station manager at ${booking.station.manager.email}.

Thank you for using EV Charge Hub!
        `,
      });
    }

    booking.status = "canceled";
    await booking.save();

    return res.status(200).json({
      message: "Booking canceled successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error in cancelBooking with refund:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const allBookings = await Booking.find({
      user: userId,
      station: { $ne: null },
    })
      .populate("station", "name") // populate only station name
      .sort({ startTime: -1 });

    const upcoming = allBookings.filter(
      (booking) =>
        booking.status === "booked" && new Date(booking.startTime) > now
    );

    const history = allBookings.filter(
      (booking) =>
        booking.status !== "booked" || new Date(booking.startTime) <= now
    );
    // console.log("Upcoming Bookings: ", upcoming);
    // console.log("Booking History: ", history);
    return res.status(200).json({ upcoming, history });
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
      "_id name email"
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

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate({
        path: "station",
        populate: { path: "manager", select: "email name" },
      });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "booked") {
      return res.status(400).json({ message: "Only active bookings can be marked as no-show" });
    }

    const user = booking.user;
    const station = booking.station;

    // Handle online paid booking
    if (booking.paymentMethod === "online") {
      if (booking.paymentStatus !== "paid") {
        return res.status(400).json({ message: "Booking cannot be marked as no-show before payment is done." });
      }

      const refundAmount = Math.round(booking.totalAmount * 0.6);
      const penaltyAmount = Math.round(booking.totalAmount * 0.4);

      // Refund 60% via Stripe
      if (!booking.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found for this booking" });
      }
      
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refundAmount * 100,
      });   
      user.totalPenalties += penaltyAmount;
      user.save({ validateBeforeSave: false });

      booking.status = "no-show";
      booking.penaltyApplied = penaltyAmount;
      await booking.save();

      await sendEmail({
        to: user.email,
        subject: "Booking Marked as No-Show",
        text: `
Hi ${user.name},

Your booking at "${station.name}" was marked as a No-Show.
40% of the payment (₹${penaltyAmount}) has been deducted as penalty.
The remaining 60% (₹${refundAmount}) has been refunded to your original payment method.

If you believe this was an error, please contact the station manager:
Email: ${station.manager.email}

Thank you,
EV Charge Hub Team
        `
      });

    } else {
      // Handle offline payment
      const penaltyAmount = Math.round(booking.totalAmount * 0.4);
      user.pendingPenalty += penaltyAmount;
      user.totalPenalties += penaltyAmount;
      await user.save({ validateBeforeSave: false });

      booking.status = "no-show";
      booking.penaltyApplied = penaltyAmount;
      await booking.save();

      await sendEmail({
        to: user.email,
        subject: "Booking Marked as No-Show",
        text: `
Hi ${user.name},

Your booking at "${station.name}" was marked as a No-Show.
₹${penaltyAmount} will be charged as a penalty on your next booking (offline payment).

If you believe this was an error, please contact the station manager:
Email: ${station.manager.email}

Thank you,
EV Charge Hub Team
        `
      });
    }

    return res.status(200).json({
      message: "User marked as no-show. Appropriate penalty/refund handled.",
      booking,
    });

  } catch (error) {
    console.error("Error in noShowBooking controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate({
        path: "station",
        populate: { path: "manager", select: "email name" },
      });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    

    if (booking.status !== "booked") {
      return res
        .status(400)
        .json({ message: "Only active bookings can be marked as completed" });
    }
    if (
      booking.paymentMethod === "online" &&
      booking.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        message: "Booking cannot be completed before payment is done.",
      });
    }

    const user = booking.user;
    const station = booking.station;

    let totalCost = booking.totalAmount;

    if (user.pendingPenalty > 0) {
      totalCost += user.pendingPenalty;
      user.pendingPenalty = 0;
      await user.save({ validateBeforeSave: false });
    }

    totalCost = Math.max(totalCost, 0);
    booking.paymentStatus = "paid";
    booking.status = "completed";
    booking.totalAmount = totalCost;
    await booking.save();

    const rewardAmount = totalCost * 0.05; // 5% of total cost
    user.rewards += rewardAmount;
    await user.save({ validateBeforeSave: false });

    // ✅ Send email to user
    await sendEmail({
      to: user.email,
      subject: "Booking Completed Successfully",
      text: `
Hi ${user.name},

✅ Your booking at "${station.name}" has been marked as **completed**.
🎁 You have earned a reward of ₹${rewardAmount}, which will be applied on your next booking.

If you have any questions, you can reach out to the station manager:
📧 ${station.manager.email}

Thank you for using EV Charge Hub!
      `,
    });

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
