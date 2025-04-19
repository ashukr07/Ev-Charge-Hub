import express from "express";
import {
    createCheckoutSession,
    stripeWebhook,
    handlePaymentFailure,
    getSessionDetails,
    markBookingAsPaid,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Stripe Checkout
router.post("/create-checkout-session", createCheckoutSession);

// Stripe Webhook (uses raw body!)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Cancelled Payment Cleanup
router.post("/cancel-payment", handlePaymentFailure);
router.get("/session-details/:sessionId", getSessionDetails);
router.put("/mark-paid", markBookingAsPaid);



export default router;
