import jwt from "jsonwebtoken"
import User from "../models/user.model.js";



export const protectRoute = async (req,res, next) => {
    try {
        //console.log("Cookies received:", req.cookies);
        const accessToken = req.cookies.accessToken;
        //console.log(accessToken)
        if(!accessToken){
            return res.status(400).json({message:"Unauthorized-Login or signup to proceed"})
        }
        try {
            const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
            //console.log(decoded)
            const user = await User.findById(decoded._id).select("-password -refreshToken")
            if(!user){
                return res.status(400).json({message:"user not found"})
            }
        
            req.user = user;
            next()
        } catch (error) {
            if(error.name === "TokenExpiredError"){
                return res.status(400).json({message:"Unauthorized - Access Token expired"})
            }
            throw error
        }
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(400).json({message:"Unauthorized - Invalid token"}) 
    }
}
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied!" });
        }
        next();
    };
};

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next();
    }else{
        return res.status(403).json({message:"Access denied! Only admins can access this route"})
    }
};

export const isManager = (req, res, next) => {
    if(req.user && req.user.role === "manager"){
        next();
    }else{
        return res.status(403).json({message:"Access denied! Only managers can access this route"})
    }
};
