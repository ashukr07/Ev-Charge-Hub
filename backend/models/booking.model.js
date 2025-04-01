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
    usedCoupon: { 
        type: Boolean, 
        default: false 
    }, // If discount was used

    status: { 
        type: String, 
        enum: ["booked", "canceled", "completed", "no-show"], default: "booked" 
    },
},{timestamps: true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

