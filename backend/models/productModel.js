import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type:String,
    required:[true,"Please Enter Product Category"]
  },
  stock:{
    type:Number,
    required:[true,"Please Enter Product Stock "],
    maxLength:[4,"Stock cannot exceed 4 character"],
    default:1
  },
  numOfReviews:{
    type:Number,
    default:0
  },
  reviews:[
    {
    user:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },
      name:{
        type:String,
        required:true
      },
      ratings:{
        type:Number,
        required:true
      },
      comment:{
        type:String,
        required:true
      }
    }
  ],
  user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
});

const Product =model("Product",productSchema)
export default Product