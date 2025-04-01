import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
    slotNumber: {
        type: Number,
        required: true,
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
    },
    status: {
        type: String,
        enum: ["available", "booked", "in-use"],
        default: "available",
    }
},{timestamps: true});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
