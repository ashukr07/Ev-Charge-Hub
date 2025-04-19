import cors from "cors"
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import cookieParser from 'cookie-parser';


import authRoutes from "./routes/auth.route.js";
import stationRoutes from "./routes/station.route.js";
import bookingRoutes from "./routes/bookings.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import paymentRoutes from "./routes/payment.route.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173", // ✅ Allow frontend to make requests
  credentials: true, // ✅ Allow cookies and authentication headers
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({limit: "10mb"}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/station", stationRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/payment", paymentRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB()
});


