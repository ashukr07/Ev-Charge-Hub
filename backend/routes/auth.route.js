import express from 'express';
import { adminDashboard, changePassword, forgotPassword, getUserDetails, login, logout, managerDashboard, resendOTP, resetPassword, signup, userDashboard, verifyOTP } from '../controllers/auth.controller.js';
import { authorizeRoles, protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/resend-otp",resendOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword); //reset password using otp
router.put("/change-password",protectRoute, changePassword); //change password using old password
router.post("/logout",protectRoute, logout);
router.get("/user-dashboard", protectRoute, authorizeRoles("user"),userDashboard);
router.get("/manager-dashboard", protectRoute, authorizeRoles("manager"), managerDashboard);
router.get("/admin-dashboard", protectRoute, authorizeRoles("admin"), adminDashboard);
router.get("/profile",protectRoute, getUserDetails); //get user details
export default router;