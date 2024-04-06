const jwt = require('jsonwebtoken')
const {USER, DOCTOR} = require('../model/usermodel.js')
const asyncHandler = require('express-async-handler')
require('dotenv').config({path : '../.env'})

exports.authenticateUser = asyncHandler(async(req,res,next) => {
 try{
     //Cookies.get('username')
    let token = req.cookies.jwtoken
    console.log("auth: ", req.cookies)
    if(token)
    {
      console.log("auth token:" , token)
      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      console.log("Decoded", decoded)
      const rootUser = await USER.findById(decoded._id);
      if(!rootUser){
        console.log("User not found")
    
      }
      
      req.rootUser = rootUser
      // console.log("authenticate: ", rootUser)
      next()
    }
    
  }
  catch(e){
    console.log("Error: ", e)
    return res.json({ status:300, msg: "Unauthorized"})
  }
  
})

exports.authenticateDoctor = asyncHandler(async(req,res,next) => {
    try{
        //Cookies.get('username')
       let token= req.cookies.jwtoken
   
      if(token)
      {
      // let token = req.headers.authorization.split(" ")[1];
       console.log("auth token:" , token)
       const decoded = jwt.verify(token, process.env.SECRET_KEY)
       console.log("Decoded", decoded)
       const rootUser = await DOCTOR.findById({_id:decoded._id})
       console.log("Rootuser", rootUser)
       if(!rootUser){
           throw new Error("User not found")
       }
   
       req.token = token
       req.rootUser = rootUser
       req.userId = rootUser._id
       next()
      }
       
     }
     catch(e){
       console.log("Error: ", e)
       return res.json({ status:300, msg: "Unauthorized"})
     }
   })