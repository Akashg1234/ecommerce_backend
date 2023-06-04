const e = require('express')
const nodemailer = require('nodemailer')

module.exports = async(options)=>{
    // console.log('Send mail.... *')
    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:false,
        service:process.env.SMTP_SERVICE,
        auth:{
            type:'OAuth2',
            user:process.env.SMTP_EMAIL,
            pass:process.env.SMTP_PASSWORD
        }
    })
    // console.log(transporter)

    const mailOptions={
        from:process.env.SMTP_EMAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    
    await transporter.sendMail(mailOptions).then(console.log('mail sended')).catch((err)=>{
        console.log(err)
    })
}