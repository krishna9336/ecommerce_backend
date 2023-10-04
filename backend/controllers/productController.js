import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ApiFeatures from "../utils/apifeatures.js";


export const createProduct = catchAsyncError(async (req, res, next) => {

req.body.user=req.user.id;


  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

export const getAllProducts = catchAsyncError(async (req, res) => {

  const resultPerPage=4;
  const productsCount=await Product.countDocuments();

 const apiFeature= new ApiFeatures(Product.find(),req.query)
 .search()
 .filter()
 .pagination(resultPerPage)
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    products,
    productsCount,
  });
});

export const getProductDetails = catchAsyncError(async (req,res,next)=>{

  const product = await Product.findById(req.params.id);

  if(!product){
    return next(new ErrorHandler("Product Not Found",404))
}
res.status(200).json({
  success:true,
  product,
})
});


export const updateProduct =catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if(!product){
    return next(new ErrorHandler("Product Not Found",404))
}
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success:true,
    product
  })
});

export const deleteProduct =catchAsyncError(async (req,res,next)=>{
    const product = await Product.findByIdAndDelete(req.params.id);

    if(!product){
    return next(new ErrorHandler("Product Not Found",500))
}
    // await product.remove();

    res.status(200).json({
        success:true,
        message:"Product Delete Successfully"
    })
});

export const createProductReview=catchAsyncError(async(req,res,next)=>{

  const {rating,comment,productId}=req.body;
  const review ={
    user:req.user._id,
    name:req.user.name,
    rating:Number(rating),
    comment,
  };
  const product=await Product.findById(productId);

  const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());

  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString()===req.user._id.toString())
      (rev.rating=rating),(rev.comment=comment);
    });
  }
  else{
    product.reviews.push(review);
    product.numOfReviews=product.reviews.length;
  }

  let avg=0;
  product.reviews.forEach((rev)=>{
    avg=avg+rev.rating;
  })
  
  product.ratings =avg/product.reviews.length;

  await product.save({validateBeforeSave:false});

  res.status(200).json({
    success:true,
  });

});


export const getProductReviews=catchAsyncError(async (req,res,next)=>{
  const product =await Product.findById(req.query.id);

  if(!product){
    return next(new ErrorHandler("Product not found ",404));
  }

  res.status(200).json({
    success:true,
    reviews:product.reviews,
  });
});


export const deleteReview=catchAsyncError(async(req,res,next)=>{
  const product=await Product.findById(req.query.productId);

  if(!product){
    return next(new ErrorHandler("Product not found ",404));
  }

  const reviews=product.reviews.filter(rev=>rev._id.toString() !== req.query.id.toString());

  let avg=0;
  reviews.forEach((rev)=>{
    avg=avg+rev.rating;
  })
  const ratings =avg/product.reviews.length;

  const numOfReviews=reviews.length;

  await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    ratings,
    numOfReviews,
  },{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  })

  res.status(200).json({
    success:true,
  });
})