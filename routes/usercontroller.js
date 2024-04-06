const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const {google} = require('googleapis')
const {registerUser,registerDoctor, login , sendMail} = require('../services/functions')
const {authenticateUser, authenticateDoctor} = require('../middleware/authenticate');
const { DOCTOR, USER } = require('../model/usermodel');

router.get("/", (req,res) => {
    res.send("Hello Router")
})

router.get("/registerUser", async(req, res) => {
    try {
        const options = { maxTimeMS: 60000 }; 
        const doctors = await DOCTOR.aggregate([
          {
            $match: {
              patients: { $exists: true, $ne: null } // Filter out documents where patients field doesn't exist or is null
            }
          },
          {
            $addFields: {
              numPatients: { $cond: { if: { $isArray: "$patients" }, then: { $size: "$patients" }, else: 0 } } // Calculate the number of patients each doctor has
            }
          },
          {
            $match: {
              numPatients: { $lt: 5 } // Find doctors with fewer than five patients
            }
          },
          {
            $project: {
              _id: 1, // Include the _id field
              name: 1 // Include the name field
            }
          }
        ], options);

        //const doctorNames = doctors.map(doctor => doctor.name);
        res.status(200).json({doctors: doctors});
      } catch (error) {
        console.error("Error:", error);
      }
})
router.post("/registerUser", registerUser )
router.post("/registerDoctor", registerDoctor )
router.post("/login", login)
router.get("/showDocProfile", authenticateDoctor, async(req, res) => {
    res.status(200).json({rootUser:req.rootUser})
})
router.get("/myPatientProfile", authenticateDoctor, async(req, res) => {
    //res.status(200).json({rootUser:req.rootUser})
    try {
        // Fetch patient profiles using the IDs stored in the root user's patients array
        const patientProfiles = await USER.find({ _id: { $in: req.rootUser.patients } });

        // Display the fetched patient profiles
        res.status(200).json({patientProfiles:patientProfiles});
    } catch (error) {
        console.error("Error fetching patient profiles:", error);
    }
})

/*Oauth2*/ 
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

/*Oauth2*/ 

router.post("/sendMail",authenticateDoctor, async(req,res) => {

    const {subject, negetive_comms, positive_comms, comments} = req.body
    const to_mail = req.params.email
    const from_mail = req.rootUser.email
    console.log("Mail", to_mail)
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
        service: 'gmail',           
        auth: {
          type: 'oAuth2',
          user:process.env.GMAIL,
          pass: process.env.PASSWORD,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken : REFRESH_TOKEN,
          accessToken : accessToken 
        },
      });
    

    if(to_mail){

        const mailOptions = {
            from:process.env.GMAIL,
            to: docMail,
            subject: subject ,
            text: `Dear user,

            You have requested a One-Time Password (OTP) and here is your OTP:.
            
            Please use this OTP within the next 5 minutes to complete your registration.
            
            If you did not request this OTP or have any concerns, please contact our support team.
            
            Thank you for choosing Local Karobar.
            
            Sincerely, 
            
            Team Local Karobar `,
            //html : '<h1> Hello you have email from LocalKarobar</h1>',
          };

        transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error(error);
          return res.json({ status: 500, msg: 'Error sending Mail'});
        }
        return res.json({status: 201,  msg: "Send to email address"})
        });

    }
})

module.exports = router;