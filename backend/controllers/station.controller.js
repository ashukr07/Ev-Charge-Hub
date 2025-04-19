import Booking from "../models/booking.model.js";
import Station from "../models/station.model.js";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";

export const addStation = async (req, res) => {
  try {
    const { name, latitude, longitude, totalSlots, description, address } =
      req.body;
    const location = { latitude, longitude };
    const manager = req.user._id;
    //if any field is empty return error
    if (
      !name ||
      !latitude ||
      !longitude ||
      !totalSlots ||
      !description ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check if station already exists
    const stationExists = await Station.findOne({
      name,
      location,
    });
    if (stationExists) {
      return res.status(400).json({ message: "Station already exists" });
    }
    //create new station
    const station = await Station.create({
      name,
      location,
      totalSlots,
      description,
      address,
      manager,
    });
    if (!station) {
      return res
        .status(400)
        .json({ message: "Station could not be created. Please try again" });
    }
    return res
      .status(201)
      .json({ message: "Station created successfully", station });
  } catch (error) {
    console.error("Error in addStation controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const approveStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(400).json({ message: "Station not found" });
    }
    station.isApproved = true;
    await station.save();
    return res.status(200).json({ message: "Station approved successfully" });
  } catch (error) {
    console.error("Error in approveStation controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const rejectStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    const station = await Station.findByIdAndDelete(stationId);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    const manager = await User.findById(station.manager);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // ✅ Setup transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // Set to true if using port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"EV Charge Hub" <${process.env.EMAIL_USER}>`,
      to: manager.email,
      subject: "Station Rejection Notice - EV Charge Hub",
      html: `
        <p>Dear ${manager.name},</p>
        <p>We regret to inform you that your charging station <strong>${station.name}</strong> located at <em>${station.address}</em> has been rejected by the admin.</p>
        <p>If you believe this was a mistake, please reach out to support for clarification.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>EV Charge Hub Team ⚡</strong></p>
      `,
    };

    // ✅ Send email (optional)
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("❌ Failed to send rejection email:", emailErr.message);
      // Optional: continue without crashing
    }

    return res.status(200).json({ message: "Station rejected successfully" });

  } catch (error) {
    console.error("Error in rejectStation controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getApprovedStations = async (req, res) => {
  try {
    const stations = await Station.find({ isApproved: true });
    return res.status(200).json({ stations });
  } catch (error) {
    console.error("Error in getApprovedStations controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    return res.status(200).json({ stations });
  } catch (error) {
    console.error("Error in getAllStations controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getUnapprovedStations = async (req, res) => {
  try {
    const station = await Station.find({ isApproved: false });
    if (!station) {
      return res.status(404).json({ message: "No unapproved stations found" });
    }
    return res.status(200).json({ station });
  } catch (error) {
    console.error("Error in getUnapprovedStations controller ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findById(stationId);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    // Extract fields from request body
    const { name, latitude, longitude, totalSlots, description, address, status } =
      req.body;

    // Update only provided fields
    if (name) station.name = name;
    if (latitude && longitude) station.location = { latitude, longitude };
    if (totalSlots !== undefined) station.totalSlots = totalSlots;
    if (description) station.description = description;
    if (address) station.address = address;
    if (status) station.status = status;

    await station.save();
    return res
      .status(200)
      .json({ message: "Station updated successfully", station });
  } catch (error) {
    console.error("Error in updateStation controller:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getManagerStation = async (req, res) => {
  try {
    const manager = req.user._id;
    const station = await Station.find({ manager });
    return res.status(200).json({ station });
  } catch (error) {
    console.error("Error in getManagerStation controller");
    return res.status(500).json({ message: error.message });
  }
};

export const getBookingsForStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    const bookings = await Booking.find({ station: stationId })
      .populate("user", "name email") // Optional: populate user details
      .sort({ startTime: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error in getBookingsForStation controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
