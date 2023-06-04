const ErrorHandler = require('../Utils/errorHandler')
const ApiFeatures = require('../Utils/apiFeatures')
const userModel = require('../DB/Models/userModel')
const catchAsyncError = require('../Middleware/catchAsyncError')
const jwtToken = require('../Utils/jwtToken')
const sendEmail = require('../Utils/sendEmail')

// Defining errors
const emailPasswordError = new ErrorHandler('Please fill correct Email & Password',401)

exports.registerUser = catchAsyncError(async (req,res)=>{
    const {name,email,password} = req.body
    const user = await userModel.create({
        name,email,password,
        avatar:{
            public_id:"public id",
            url:"url of avatar",
        }
    })

    jwtToken(user,201,res)
})

// Login User
exports.loginUser=catchAsyncError(async (req,res,next)=>{
    // console.log(req.body)
    const {email,password} = req.body

    if(!email || !password){
        return next(emailPasswordError)
    }

    const user = await userModel.findOne({email}).select('+password')
    // console.log(user)
    if(!user){
        return next(emailPasswordError)
    }

    const isPasswordMatched = await user.comparePassword(password)

    // console.log(isPasswordMatched)

    if(!isPasswordMatched){
        return next(emailPasswordError)
    }

    jwtToken(user,200,res)
})

// Logout User
exports.logoutUser = catchAsyncError(async(req,res,next)=>{

    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
})

// Forgot password user
exports.forgotPassword = catchAsyncError(async (req,res,next)=>{

    const user = await userModel.findOne({email:req.body.email})
    // console.log(user)

    if(!user){
        return next(new ErrorHandler('User not found',404))
    }

    const resetToken = user.getPasswordResetToken()

    // console.log(resetToken)

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :: ${resetPasswordUrl}\n\n If you did not request reset, then please ignore it.`

    try {
        await sendEmail({
            email:user.email,
            subject:"E-commerce password recovery",
            message
        })

        res.status(200).json({
            success:true,
            message: `Email has been send successfully to ${user.email}`
        })

        // console.log('end of try  ')
    } catch (error) {

        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })

        // console.log(user)

        return next(new ErrorHandler(error.message,500))
    }
})

exports.resetPassword = catchAsyncError(async(req,res,next)=>{

    const resetPasswordToken = crypto.createHash('sha512').update(resetToken).digest('hex')

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('User not found',404))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password not matched',404))
    }

    user.password=req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })

    jwtToken(user,200,res)
})

// Get user details
exports.getUserDetails = catchAsyncError(async (req,res,next)=>{

    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})

// Update user password
exports.updatePassword= catchAsyncError(async (req,res,next)=>{

    const user = await userModel.findById(req.user._id).select("+password")
    // console.log(user)

    const {oldPassword,newPassword,confirmPassword}=req.body
    
    const isPasswordMatched = await user.comparePassword(oldPassword)

    // console.log(isPasswordMatched)

    if(!isPasswordMatched){
        return next(new ErrorHandler('Password not matched',400))
    }

    if(newPassword !== confirmPassword){
        return next(new ErrorHandler('Confirm password not matched',400))
    }

    user.password = newPassword;
    await user.save()

    jwtToken(user,200,res)
})


// Update user Profile
exports.updateUserProfile = catchAsyncError(async (req,res,next)=>{
    const newUserDaa = {name:req.body.name,email:req.body.email}

    //Cloudinary Avatar will added later

    const user = await userModel.findByIdAndUpdate(req.user.id,newUserDaa,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        user
    })
})

// Get all users
exports.getAllUsers = catchAsyncError(async (req,res,next)=>{
    const users = await userModel.find()

    res.status(200).json({
        success:true,
        users
    })
})

// get single user
exports.getSingleUser = catchAsyncError(async (req,res,next)=>{
    const user = await userModel.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(`User not matched with this id: ${req.params.id}`,400))
    }
    res.status(200).json({
        success:true,
        user
    })
})

// Update user Role
exports.updateUserRole = catchAsyncError(async (req,res,next)=>{
    const newUserDaa = {name:req.body.name,email:req.body.email, role:req.body.role}

    //Cloudinary Avatar will added later

    const user = await userModel.findByIdAndUpdate(req.user.id,newUserDaa,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        user
    })
})


// Delete user -- Admin
exports.deleteUser = catchAsyncError(async (req,res,next)=>{

    const user = await userModel.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    await user.remove()

    res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })
})