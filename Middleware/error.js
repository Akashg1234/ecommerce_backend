const ErrorHandler = require('../Utils/errorHandler')

module.exports=(err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"
    
    //Mongodb ID Error Handling
    if(err.name==='CastError'){
        const errorMessage = `Resource not found error ${err.path}`
        err = new ErrorHandler(errorMessage,400)
    }

    // Mongoose duplicate key error
    if(err.code=== 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message,400)
    }

    // wrong JWT error
    if(err.name==='JsonWebTokenError'){
        const errorMessage = `Json Web Token is Invalid, try again`
        err = new ErrorHandler(errorMessage,400)
    }

    // Json web token expired
    if(err.name==='TokenExpiredError'){
        const errorMessage = `Json Web Token is expired, try again`
        err = new ErrorHandler(errorMessage,400)
    }
    
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}