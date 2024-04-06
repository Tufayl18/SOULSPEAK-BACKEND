const mongoose = require('mongoose')
require('dotenv').config({path : '././.env'})

const connectDB = async () => {
    try{
        // console.log("MongoURI: ", process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI)
        //console.log(`connected mongo ${conn}`)
    }
    catch(error){
        console.log("db.js error: ", error.message)
        process.exit(1)
    }
}

module.exports = connectDB;