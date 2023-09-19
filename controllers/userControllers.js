const express = require("express");
const users = require('../models/customerSchema');
const userotp = require('../models/customerOtp');
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { google } = require("googleapis");
dotenv.config();


/*POPULATE BELOW FIELDS WITH YOUR CREDETIALS*/

const CLIENT_ID = "842766566164-tckpe8v0ff9o1oitkfgabek1vg7025ck.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =process.env.REFRESH_TOKEN;
  
const  REDIRECT_URI = "https://developers.google.com/oauthplayground"; //DONT EDIT THIS
const MY_EMAIL = "cheekatlatejaswini@gmail.com"

/*POPULATE ABOVE FIELDS WITH YOUR CREDETIALS*/

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({
  access_token:process.env.ACCESS_TOKEN,
});

//YOU CAN PASS MORE ARGUMENTS TO THIS FUNCTION LIKE CC, TEMPLATES, ATTACHMENTS ETC. IM JUST KEEPING IT SIMPLE
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: oAuth2Client.getAccessToken(),
      }
    });



const userregister = async(req,res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    try {
        const preuser = await users.findOne({ email: email });
        console.log(preuser);
        if (preuser) {
            res.status(400).json({ error: "This User already exists in our db" });
        } else {
            const userregister = new users({ name, email, password });
            console.log("we are here");
            const storeData = await userregister.save();
            res.status(200).json(storeData);
        };

    } catch (error) {
        res.status(400).json({ error: "Invalid details", error });
    }
}

const userOtpSend = async (req, res) => {
    const { email } = req.body;
    console.log(email);

    try {
        const preuser = await users.findOne({ email: email });
        if (preuser) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            const existEmail = await userotp.findOne({ email: email });
            console.log(existEmail);
            if (existEmail) {
                const updateData = await userotp.findByIdAndUpdate({ _id: existEmail.id }, { otp: OTP }, { new: true });
                await updateData.save();

                const mailOptions = {
                    from: MY_EMAIL,
                    to: email,
                    subject: "Sending Email For Otp Validation",
                    text: `OTP:- ${OTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("Error during sending email:",error);
                        res.status(400).json({ error: "email not sent" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json(info);
                    }
                })
            } else {
                const saveOtpData = new userotp({ email, otp: OTP });
                await saveOtpData.save();
                const mailOptions = {
                    from: MY_EMAIL,
                    to: email,
                    subject: "Sending Email For Otp Validation",
                    text: `OTP:- ${OTP}`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log("error", error);
                      res.status(400).json({ error: "email not sent" });
                    } else {
                      console.log("Email sent", info.response);
                      res.status(200).json(info);
                    }
                })
            }
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details", error });
    }
}

const userLogin = async (req, res) => {
    const { otp, email } = req.body;
    try {
        const otpverification = await userotp.findOne({ email: email });
        if (otpverification.otp === otp) {
            const preuser = await users.findOne({ email: email });

            //token generate
            const token = await preuser.generateAuthtoken();
            res.status(200).json({ message: "user login successfully done", userToken: token });
        } else {
            res.status(400).json({ error: "Invalid otp" });
        }
        
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error });
    }
    
};

module.exports = { userregister, userOtpSend,userLogin };