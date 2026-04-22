const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
 service:"gmail",
 auth:{
  user:process.env.EMAIL_USER,
  pass:process.env.EMAIL_PASS
 }
});

exports.sendOTPEmail = async(email,otp)=>{
 await transporter.sendMail({
 from:process.env.EMAIL_USER,
 to:email,
 subject:"Verify your account",
 html:`
   <h2>Your OTP</h2>
   <h1>${otp}</h1>
   <p>Expires in 5 minutes</p>

  `
 });

};