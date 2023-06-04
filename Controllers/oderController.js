const Order = require('../DB/Models/orderModel')
const Product = require('../DB/Models/productModel')
const ErrorHandler = require('../Utils/errorHandler')
const catchAsyncError = require('../Middleware/catchAsyncError')

// get new order
exports.newOrder = catchAsyncError(async (req,res,next)=>{

  // console.log(req.body)
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body

    const order = await Order.create({shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),user:req.user._id})

    res.status(201).json({
        success: true,
        order,
      });
})


// get single order
exports.getSingleOrder = catchAsyncError(async (req,res,next)=>{

  const order = await Order.findById(req.params.id).populate('user',"name email")

  if(!order){
    return next(new ErrorHandler("Order not found with this id",404))
  }

  res.status(200).json({
    success: true,
    order,
  });

})

// Get all logged in user order
exports.getMyOrders = catchAsyncError(async (req,res,next)=>{

  const orders = await Order.find({user:req.user._id})

  res.status(200).json({
    success: true,
    orders,
  });

})

// Get all orders --Admin
exports.getAllOrders = catchAsyncError(async (req,res,next)=>{

  const orders = await Order.find()

  let totalOrderAmount = 0;

  orders.forEach(order => {
    totalOrderAmount+= order.totalPrice
  });

  res.status(200).json({
    success: true,
    totalOrderAmount,
    orders,
  });

})

// Delete all orders --Admin
exports.deleteOrder = catchAsyncError(async (req,res,next)=>{

  const order = await Order.findById(req.params.id)

  if(!order){
    return next(new ErrorHandler("Order not found with this id",404))
  }

  await order.remove()

  res.status(200).json({
    success: true,
    order,
  });

})


// Update stock

async function updateStock(id,quantity) {
  
  const product = await Product.findById(id)

  if(!product){
    return next(new ErrorHandler("Product not found",404))
  }

  product.stock-=quantity

  await product.save({validateBeforeSave:false})
}

// Update all orders --Admin
exports.updateOrderStatus = catchAsyncError(async (req,res,next)=>{

  const orders = await Order.findById(req.params.id)

  if(!orders){
    return next(new ErrorHandler("Order not found",404))
  }

  if(orders.orderStatus==="Delivered"){
    return next(new ErrorHandler("Order has been delivered",400))
  }

  orders.orderItems.forEach(async(order)=>{
    await updateStock(order.product,order.quantity)
  })

  orders.orderStatus = req.body.status

  if(req.body.status ==="Delivered"){
    orders.deliveredAt = Date.now()
  }

  await orders.save({validateBeforeSave:false})

  res.status(200).json({
    success: true,
    orders,
  });

})