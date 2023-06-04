const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const bodyParser = require('body-parser')
const port = process.env.PORT
const {dbConnection} = require('./DB/Connection')
const errorMiddleWare = require('./Middleware/error')
const cookieParser = require('cookie-parser')

// Uncaught exception handling
process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    process.exit(1);
})

const app=express()

app.use(bodyParser.urlencoded({
    extended: true
  }))
app.use(bodyParser.json())
app.use(cookieParser())

// Database connection import
dbConnection()

// Route import
const productRoute = require('./Routes/productRoute')
const userRoute = require('./Routes/userRegisterRoute')
const orderRoute = require('./Routes/orderRoute')

// use product route to navigate into the product page
app.use('/api/v1/',productRoute)
app.use('/api/v1/',userRoute)
app.use('/api/v1/',orderRoute)


// Error Middleware

app.use(errorMiddleWare)

const server = app.listen(port,()=>{
    console.log(`Port running on ${port}`)
})

// Unhandled promise rejection
process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
})