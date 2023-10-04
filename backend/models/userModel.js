import { Schema, model } from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot exceed 30 character"],
        minLength:[4,"Name must be atleast 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minLength:[8,"Password should be greater than 8 Character"],
        select:false,
    },
    avatar:{
          public_id: {
            type: String,
            // required: true,
          },
          url: {
            type: String,
            // required: true,
          },
        },
    role:{
        type:String,
        default:"user",
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
});

//JWT Token
userSchema.methods.getJWTToken=function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

// Comapare Password
userSchema.methods.comparePassword =async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken =function(){
    
    //Generating Token
    const resetToken=crypto.randomBytes(20).toString("hex");

    //Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    
    this.resetPasswordExpire=Date.now() +15 *60*1000;
    return resetToken;
}

const User =model("User",userSchema);
export default User;