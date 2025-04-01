import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Booking", 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ["online", "offline"], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending", "completed", "failed", "refunded"], 
        default: "pending" 
    },
    discountApplied: { 
        type: Number, 
        default: 0 
    },
},{timestamps: true});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;


