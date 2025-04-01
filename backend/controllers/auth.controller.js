import { sendOTP } from "../utils/sendOtp.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const resendOTP = async (req, res) => {
    try {
        const {email} = req.body;

        // Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Generate and send new OTP
        const newOTP = await sendOTP(email);
        const newOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with new OTP and expiry
        user.otp = newOTP;
        user.otpExpires = newOTPExpires;
        await user.save({validateBeforeSave: false});

        res.status(200).json({ message: "New OTP sent successfully" });
    } catch (error) {
        console.error("Error in resendOTP controller:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateAccessAndRefreshToken controller:", error.message);
        return res.status(500).json({error: "Something went wrong while generating access and refresh tokens"});
    }
}

export const signup = async (req, res) => {
    try{
        const {name, email, password,confirmPassword,role} = req.body;
        
        if(password !== confirmPassword){
            return res.status(400).json({message: "Password and confirm password do not match"});
        }
        // Check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }
        // Create new user
        const otp  = await sendOTP(email);
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        console.log(otp, otpExpires);
        const user = await User.create({name, email, password, otp, otpExpires, role});
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if(!createdUser){
            return res.status(400).json({message: "Something went wrong while creating user"});
        }
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        res.status(200).json({ message: "OTP sent to email, please verify your account.", user: createdUser, accessToken});
    }catch(error){
        console.log("Error in signup controller ", error.message);
        return res.status(500).json({error: error.message});
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email,otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({validateBeforeSave: false});

        res.status(200).json({ message: "Account verified successfully!", user});
    } catch (error) {
        console.log("Error in verifyOTP controller ", error.message);
        return res.status(500).json({error: error.message});
    }
}

export const login = async (req, res) => {
    try {
        console.log("Login request received:", req.body); // Debug request data
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Missing email or password" });
  }
        const { email, password,role } = req.body;

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Ensure correct role is used for login
        if (user.role !== role) {
            return res.status(400).json({ message: `Invalid role! You are registered as ${user.role}` });
        }

        // If user is NOT verified, resend OTP and ask for verification
        if (!user.isVerified) {
            const newOTP = await sendOTP(email);
            user.otp = newOTP;
            user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
            await user.save({ validateBeforeSave: false });

            return res.status(403).json({ 
                message: "Please verify your account before logging in. OTP sent again.", 
                redirect: "/verify-otp",
                email
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: `Login successful as ${role}`,
                accessToken,
                refreshToken,
                user: loggedInUser
        });
    } catch (error) {
        console.error("Error in login controller ", error.message);
        return res.status(500).json({ message: error.message });
    }
};


export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {new: true}
        );
        const options = {
            //after this, can only be modified through the server
            httpOnly:true,
            secure:true,
        }
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken", options)
        .json({message: "User logged out successfully"});
    } catch (error) {
        console.error("Error in logout controller ", error.message);
        return res.status(500).json({error: error.message});
    }
};

export const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken) 
            return res.status(401).json({message: "Unauthorized Request"});

        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user =  await User.findById(decodedToken?._id)
        if(!user) 
            return res.status(400).json({message: "Invalid refresh token"});
        
        if(user.refreshToken !== incomingRefreshToken)
            return res.status(400).json({message: "Refresh token does not match"});
        
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true,
        }
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error("Error in refreshToken controller ", error.message);
        return res.status(500).json({error: error.message});

    }
}

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "User not found"});

        const otp = await sendOTP(email);
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({validateBeforeSave: false});

        return res.status(200).json({message: "OTP sent to email, please reset your password"});
        
        
    } catch (error) {
        
    }
}

export const resetPassword = async (req, res) => {
    try {
        
        const { otp, newPassword } = req.body;
        const user = await User.findOne({ otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        
        user.password = newPassword;
        user.otp = undefined; // Remove OTP after use
        user.otpExpires = undefined;

        await user.save();
        return res.status(200).json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        console.error("Error in resetPassword controller ", error.message);
        return res.status(500).json({error: error.message});
    }
}   

export const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;
        if(newPassword !== confirmPassword) return res.status(400).json({message: "New password and confirm password do not match"});
        console.log(req.user);
        const user = await User.findById(req.user._id);
        if(!user) return res.status(400).json({message: "User not found"});
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isMatch) return res.status(400).json({message: "Old password is incorrect"});
        user.password = newPassword;
        await user.save({validateBeforeSave: false});
        return res.status(200).json({message: "Password changed successfully"});
    } catch (error) {
        console.error("Error in changePassword controller ", error.message);
        return res.status(500).json({error: error.message});
    }
}

export const managerDashboard = async (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to Manager Dashboard" });
    } catch (error) {
        console.error("Manager Dashboard Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const adminDashboard = async (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to Admin Dashboard" });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const userDashboard = async (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to User Dashboard" });
    } catch (error) {
        console.error("User Dashboard Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
