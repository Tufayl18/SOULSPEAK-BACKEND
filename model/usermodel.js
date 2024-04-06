const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({path : '../.env'})

const userSchema = new mongoose.Schema({
    name : {
        type : String
    },
    email : {
        type : String
    },
    password : {
        type : String
    },
    contact : {
        type : Number
    },
    gender : {
        type : String
    },
    dob : {
        type : String
    },
    emergency_contact : {
        type : String
    },
    primary_concern :  {
        type : String
    },
    preferred_therapist : {
        type: String
    },
    treatment_history : {
        type : String
    }
})

const doctorSchema = new mongoose.Schema({
    name: {
        type : String
    },
    email: {
        type : String
    },
    password: {
        type : String
    },
    contact : {
        type : Number
    },
    license_Number :  {
        type  : String
    },
    experience : {
        type : String
    },
    patients : [
        {type: String}
    ]
})
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12)
        }
    next()
})

doctorSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12)
        }
    next()
})

userSchema.methods.generateUserTokens = async function (res) {
    try{
        const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY )
        res.cookie('jwtoken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict', //ssr attcaks
            expires: new Date(
                Date.now() + 30*  24 * 60 * 60 * 1000
            )
        })

        return token
    }catch(err){
        console.log("Error at token generation", err)
    }
}
doctorSchema.methods.generateDoctorTokens = async function (res){
    try{
        // console.log("HotelID:", this._id);
        const token = jwt.sign( { _id: this._id }, process.env.SECRET_KEY)
        res.cookie('jwtoken', token, { 
            httpOnly: true,
            secure: false,
            sameSite: 'strict', //ssr attcaks
            expires: new Date(
                Date.now() + 30*  24 * 60 * 60 * 1000
            )
        })

        return token
    }catch(err){
        console.log("Error at token generation", err)
    }
}

const USER = mongoose.model('user', userSchema)
const DOCTOR = mongoose.model( 'doctor' , doctorSchema )

module.exports = {USER, DOCTOR}