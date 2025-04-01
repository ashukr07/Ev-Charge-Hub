import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true, 
        },
    },
    totalSlots: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },//managed by manager
    isApproved: {
        type: Boolean,
        default: false,
    }, //Admin must approve the station before it can be used
    power: {
        type: Number,
        required: true,
        default: 22, //22kW
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },

},{timestamps: true});

const Station = mongoose.model("Station", stationSchema);

export default Station;
