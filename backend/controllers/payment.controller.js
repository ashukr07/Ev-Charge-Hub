// controllers/paymentController.js
import Stripe from "stripe";
import Booking from "../models/booking.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // use env variable

export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId, amount: totalAmount, email, breakdown } = req.body;

    


    // Validate booking exists
    const booking = await Booking.findById(bookingId).populate("station");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    console.log("💬 Booking:", booking);
console.log("💳 Breakdown:", breakdown);
console.log("📧 Email:", email);
console.log("💰 Total:", totalAmount);
console.log("station ",booking.station.name)

const customer = await stripe.customers.create({
  name: "Test User",
  email: email,
  address: {
    line1: "123 Test Street",
    city: "New Delhi",
    postal_code: "110001",
    country: "IN",
  },
});

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `EV Charging - ${booking.station.name}`,
              description: [
                `Base: ₹${breakdown.baseAmount}`,
                `Penalty: ₹${breakdown.penalty}`,
                `Rewards: ₹${breakdown.rewards}`,
              ].join("\n"),
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe accepts in paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failure?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
    });

    return res.status(200).json({ sessionId: session.id }); // ✅ IMPORTANT
  } catch (error) {
    console.error("Error creating Stripe session:", error.message);
    return res.status(500).json({ message: "Failed to create payment session" });
  }
};



export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;
    
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = "paid";
        booking.paymentIntentId = session.payment_intent; // Save the PaymentIntent ID
        await booking.save();
        console.log("✅ Booking payment marked as paid.");
      }
    }
    

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId } = req.body;
    await Booking.findByIdAndDelete(bookingId);
    return res.status(200).json({ message: "Booking deleted after failed payment." });
  } catch (err) {
    console.error("Failed to delete booking after failed payment:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session?.metadata?.bookingId;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID not found in session metadata" });
    }

    const booking = await Booking.findById(bookingId).populate("station", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Error in getSessionDetails:", error.message);
    return res.status(500).json({ message: "Failed to fetch booking details" });
  }
};
export const markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId, sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.stripePaymentIntentId = session.payment_intent; // ✅ Save this!
    await booking.save();

    return res.status(200).json({ message: "Booking marked as paid" });
  } catch (err) {
    console.error("Error in markBookingAsPaid:", err.message);
    return res.status(500).json({ message: "Failed to update booking status" });
  }
};