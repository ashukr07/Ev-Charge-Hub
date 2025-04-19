import Booking from '../models/booking.model.js';
import Station from '../models/station.model.js';

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId, status: 'completed' });

    let totalEnergy = 0;
    let totalAmount = 0;
    let totalRewards = 0;

    bookings.forEach(b => {
      totalEnergy += b.energyConsumed;
      totalAmount += b.totalAmount;
      totalRewards += b.rewardDiscount;
    });

    res.status(200).json({ totalEnergy, totalAmount, totalRewards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManagerAnalytics = async (req, res) => {
  try {
    const managerId = req.user._id;
    const stations = await Station.find({ manager: managerId });
    const stationIds = stations.map(s => s._id);

    const bookings = await Booking.find({ station: { $in: stationIds }, status: 'completed' });

    let totalEnergy = 0;
    let totalRevenue = 0;
    let totalBookings = bookings.length;

    bookings.forEach(b => {
      totalEnergy += b.energyConsumed;
      totalRevenue += b.totalAmount;
    });

    res.status(200).json({ totalEnergy, totalRevenue, totalBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
