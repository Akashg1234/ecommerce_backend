const jwt = require("jsonwebtoken");
const userModel = require("../DB/Models/userModel");
const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncError(async (req,res,next)=>{
    const {token}=req.cookies

    // console.log(token)

    if(!token){
        return next(new ErrorHandler('Please login to access the resource',401))
    }

    let decodedData=null
    try {
        decodedData = jwt.verify(token,process.env.JWT_SECRET_KEY)
    } catch (error) {
        console.log(error.message)
    }
    
    req.user = await userModel.findById(decodedData.jwt_id)

    // console.log(decodedData,"---",req.user)

    next()
});

exports.authorizedRoles = (...roles) =>{

    return (req,res,next)=>{

        // console.log(req)

        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(` Roles: ${(req.user.role)} is not allowed to access this resource`,401));
        }
        next();
    }
}