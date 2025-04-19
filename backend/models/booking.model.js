import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    currentBattery: { 
        type: Number, 
        required: true 
    }, // Battery % at start
    targetBattery: { 
        type: Number, 
        required: true 
    },  // Target charge level
    estimatedChargeTime: { 
        type: Number, 
        required: true 
    }, // Minutes needed
    energyConsumed: { 
        type: Number, 
        default: 0 
    }, // kWh consumed
    paymentMethod: { 
        type: String, 
        enum: ["online", "offline"], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "paid"], 
        default: "pending" 
    },
    baseAmount: { 
        type: Number, 
        required: true 
    }, // Base amount for the booking
    totalAmount: { 
        type: Number, 
        default: 0 
    }, // Final amount after penalties & rewards

    penaltyApplied: { 
        type: Number, 
        default: 0 
    }, // Any applied penalties
    rewardDiscount: { 
        type: Number, 
        default: 0 
    }, // Any applied rewards
    
    status: { 
        type: String, 
        enum: ["booked", "canceled", "completed", "no-show"], default: "booked" 
    },
    stripePaymentIntentId: { type: String },
},{timestamps: true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

