const express = require('express')
const userRoutes = require('./routes/usercontroller')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config({path : '../.env'})
const app = express()

app.use(express.json())
app.use(bodyParser.json())

app.use(cookieParser())

const connectDB = require('./config/db.js')
connectDB()

app.use("/api", userRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Running at", PORT)
})

