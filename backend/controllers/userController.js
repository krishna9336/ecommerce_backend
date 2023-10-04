import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      utl: "profilepicUrl",
    },
  });

  sendToken(user, 201, res);
});


export const loginUser=catchAsyncError(async (req,res,next)=>{

    const {email,password}=req.body;

    //Checking if user has given password and email both
    if(!email ||!password){
        return next(new ErrorHandler("Please Enter Email & Password",400))
    } 
    const user =await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password",401))
    }

    const isPasswordMatched =await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or password",401))
    }
    sendToken(user, 200, res);

});


export const logout=catchAsyncError(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"Logged out Successfully",
    })
})


export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404))
    }

    //Get resetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl =`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message=`Your password reset Token is:- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then please
    ignore it`;

    try {
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500))
    }

})

export const resetPassword=catchAsyncError(async (req,res,next)=>{

    //Creating token hash
    const resetPasswordToken=crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user =await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been Expired",400))
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not Match",400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res)

});


export const getUserDetails=catchAsyncError(async(req,res,next)=>{
const user =await User.findById(req.user.id);

res.status(200).json({
    success:true,
    user,
});

});

export const updatePassword=catchAsyncError(async(req,res,next)=>{
    const user =await User.findById(req.user.id).select("+password")

    const isPasswordMatched =await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect",400))
    }
    
    if(req.body.newPassword!==req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400))
    }

    user.password=req.body.newPassword;

    await user.save();
    
    sendToken(user,200,res);
    
    });


export const updateProfile=catchAsyncError(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
    };

    //We will add cloudinary later

    const user =await User.findByIdAndUpdate(req.body.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })


    res.status(200).json({
        success: true,
    });
    });

export const getAllUser=catchAsyncError(async (req,res,next)=>{
        const users = await User.find();
        
        res.status(200).json({
            success:true,
            users,
        })
    })
    
export const getSingleUser=catchAsyncError(async (req,res,next)=>{
        const user = await User.findById(req.params.id);

        if(!user){
            return next(new ErrorHandler(`User does not Exist with id ${req.params.id}`))
        }
        
        res.status(200).json({
            success:true,
            user,
        })
    })


export const updateUserRole=catchAsyncError(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
        email:req.body.role,
    };


    const user =await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });


    res.status(200).json({
        success: true,
        user
    });
    });


export const deleteUser=catchAsyncError(async(req,res,next)=>{

    const user=await User.findById(req.params.id);

    //We will remove cloudinary later

    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
    }

    await User.deleteOne();


    res.status(200).json({
        success: true,
        message:"User Deleted Successfully"
    });
    });