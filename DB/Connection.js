const {connect,Schema,model} = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'../config.env'})

const dbConnection =()=>{ 
    connect(process.env.DB_URI,{useNewUrlParser:true}).then(()=>{
        console.log('DB connected....!')
    })
}

module.exports={dbConnection,Schema,model}