import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncError from "./catchAsyncError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const isAuthenticatedUser=catchAsyncError(async(req,res,next)=>{
    const {token} =req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401));
    }
    const decodedData=jwt.verify(token,process.env.JWT_SECRET)

    req.user = await User.findById(decodedData.id);

    next();
})

export function authorizeRoles(...roles){
    return (req,res,next)=>{

        if(!roles.includes(req.user.role)){
            return next(
            new ErrorHandler(`Role:${req.user.role} is not allowed to access this source`,403));
        }
        next();
    };
}