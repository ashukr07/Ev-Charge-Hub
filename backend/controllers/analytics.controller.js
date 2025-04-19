

import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Station from "../models/station.model.js";
import User from "../models/user.model.js";

// Admin Analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const allBookings = await Booking.find({ status: { $ne: "cancelled" } });

    const totalRevenue = allBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const bookingStatusCount = allBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodStats = allBookings.reduce((acc, booking) => {
      acc[booking.paymentMethod] = (acc[booking.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const monthlyRevenue = {};
    allBookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
      if (booking.status === "completed") monthlyRevenue[month] += booking.totalAmount;
    });

    return res.status(200).json({
      totalRevenue,
      bookingStatusCount,
      paymentMethodStats,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Manager Analytics
export const getManagerAnalytics = async (req, res) => {
  try {
    const managerId = req.user.id;

    const stations = await Station.find({ manager: managerId }).select("_id");
    const stationIds = stations.map((s) => s._id);

    const bookings = await Booking.find({ station: { $in: stationIds } });

    const totalRevenue = bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const bookingStatus = {};
    const monthlyBookings = {};
    const paymentMethods = { online: 0, offline: 0 };
    const energyData = [];

    bookings.forEach((b) => {
      bookingStatus[b.status] = (bookingStatus[b.status] || 0) + 1;

      const month = new Date(b.startTime).toLocaleString("default", { month: "short", year: "numeric" });
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;

      if (b.paymentMethod) {
        paymentMethods[b.paymentMethod] = (paymentMethods[b.paymentMethod] || 0) + 1;
      }

      if (b.status === "completed") {
        energyData.push({
          station: b.station.toString(),
          energy: b.energyConsumed,
        });
      }
    });

    return res.status(200).json({
      totalRevenue,
      bookingStatus,
      monthlyBookings,
      paymentMethods,
      energyData,
    });
  } catch (error) {
    console.error("Manager Analytics Error:", error);
    res.status(500).json({ message: "Failed to fetch manager analytics" });
  }
};

// User Analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // assuming user is authenticated
    //console.log("User ID:", userId);
    const objectUserId = new mongoose.Types.ObjectId(userId);
    //console.log("Object User ID:", objectUserId);
    const bookings = await Booking.find({ user: objectUserId });
    const user = await User.findById(userId);
    console.log("User:", user);
    //console.log("Bookings:", bookings);

    let totalSpent = 0;
    let totalEnergyConsumed = 0;
    let totalRewards = 0;
    let totalPenalty = 0;
    let bookingStatus = { booked: 0, canceled: 0, completed: 0, "no-show": 0 };

    bookings.forEach(booking => {
      totalSpent += booking.totalAmount;
      totalEnergyConsumed += booking.energyConsumed;  // assuming energyConsumed is tracked in the booking
       

      bookingStatus[booking.status] += 1;
    });
    totalRewards = user.totalRewards || 0;  
    totalPenalty = user.totalPenalties || 0; 
    //console.log("bbokingh status", bookingStatus)


    return res.status(200).json({
      totalSpent,
      totalEnergyConsumed,
      totalRewards,
      totalPenalty,
      bookingStatus,
    });
  } catch (error) {
    console.error("Error getting user analytics:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



