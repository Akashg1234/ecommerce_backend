const Product = require('../DB/Models/productModel')
const ErrorHandler = require('../Utils/errorHandler')
const catchAsyncError = require('../Middleware/catchAsyncError')
const ApiFeatures = require('../Utils/apiFeatures')


exports.createProduct = catchAsyncError (async(req,res,next)=>{
    // console.log(req.body+'<--->'+req)
    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(200).json({
        success:true,
        product
    })
})

// get all product
exports.getAllProducts = catchAsyncError (async(req,res)=>{
    // console.log('HI Get all products')

    const resultPerPage = 8
    const productCount = await Product.countDocuments()

    // console.log('product count:'+productCount)

    const apiFeatures = new ApiFeatures(Product.find(),req.query).searchFeature().filterFeature().pagination(resultPerPage)

    let products = await apiFeatures.query
    let filteredProductsCount = products.length


    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        filteredProductsCount
    })
})

// Update product for Admin
exports.updateProduct = catchAsyncError (async(req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
}
)
// Delete product for Admin
exports.deleteProduct = catchAsyncError(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product not found",500))
    }

    await Product.remove()

    res.status(200).json({
        success:true,
        "message":"Product deleted"
    })
})

// Get product details
exports.getProductDetails = catchAsyncError (async(req,res,next)=>{
    const productDetail = await Product.findById(req.params.id)

    if(!productDetail){
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        success:true,
        productDetail
    })
})

// Create Product review or Update old one
exports.createProductReview = catchAsyncError (async(req,res,next)=>{

    const {rating,comment,productId} = req.body

    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }

    const product = await Product.findById(productId)
    const isReviewed = await product.reviews.find(
        (rev)=> rev.user.toString()===req.user._id.toString()
    )
    if(isReviewed){

        product.reviews.forEach(rev => {
            if(rev.user.toString()===req.user._id.toString()){
                rev.rating=rating
                rev.comment = comment
            }
        });
    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg=0
    product.reviews.forEach(rev => {
        avg+= rev.rating
    })
    product.rating = avg / product.reviews.length

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success:true,
    })
})

// Get all reviews of a product
exports.getAllReviewsOfAProduct = catchAsyncError (async(req,res,next)=>{
    
    const product = await Product.findById(req.query.id)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

// Delete Product review
exports.deleteProductReview = catchAsyncError (async(req,res,next)=>{
    const product = await Product.findById(req.query.productId)

    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }

    const reviews = product.reviews.filter(
        (rev)=> rev._id.toString() !== req.query.id.toString()
    )

    let avg=0
    reviews.forEach(rev => {
        avg+= rev.rating
    })

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId,
        {
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })
})