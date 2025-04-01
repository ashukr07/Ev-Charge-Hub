import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        match: [
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            "Password must have at least 1 uppercase letter, 1 number, and 1 special character",
        ],
    },
    role: {
        type: String,
        enum: ["user", "admin", "manager"],
        default: "user",
    },
    otp: {
        type: String, // Store OTP temporarily
    },
    otpExpires: {
        type: Date, // OTP expiry time
    },
    isVerified: {
        type: Boolean,
        default: false, // User must verify email via OTP
    },
    refreshToken: {
        type: String,
    },

    rewards: { 
        type: Number, 
        default: 0 
    }, // User reward points
    pendingPenalty: { 
        type: Number, 
        default: 0 
    } // Stores penalty for the next booking

},{timestamps: true});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt)
        next() 
    } catch (error) {
        next(error)
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            role:this.role,
            email:this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema);
export default User;