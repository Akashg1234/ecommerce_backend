const validator = require('validator')
const {Schema,model} = require('../Connection')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new Schema({
    name:{
        type:String,
        required:[true,"Please enter user name"],
        minLength:[5,"Name is too short in length"],
        maxLength:[30,"Name exceeded maximum length"]
    },
    email:{
        type:String,
        required:[true,"Please enter user email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid Email"],
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        minLength:[8,"Please enter password greater than 8 character"],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },
    role:{
        type:String,
        default:'user'
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date
    }
})

// Hashing password before hash

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,15)
})

// Generating jwt token

userSchema.methods.getJWToken=function () {
    return JWT.sign({jwt_id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

// Generating password reset token

userSchema.methods.getPasswordResetToken = function () {
    
    const resetToken = crypto.randomBytes(100).toString('hex')

    // console.log(resetToken)
    this.resetPasswordToken = crypto.createHash('sha512').update(resetToken).digest('hex')
    // console.log('reset password:: '+this.resetPasswordToken)
    this.resetPasswordExpire = Date.now()+ 15*60*1000
    
    return this.resetPasswordToken;

}

// Comparing password

userSchema.methods.comparePassword = async function(enteredPassword){
    // console.log(enteredPassword)

    return await bcrypt.compare(enteredPassword,this.password)
}

module.exports = new model('User',userSchema)