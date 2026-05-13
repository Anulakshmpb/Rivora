const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({

 userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'User',
  required:true
 },

 otp:{
  type:String,
  required:true
 },

 type:{
  type:String,
  enum:[
   "emailVerification",
   "passwordReset",
   "walletPayment"
  ]
 },

 attempts:{
  type:Number,
  default:0
 },

 expiresAt:{
  type:Date,
  required:true,
  index:{expires:0}
 }

},{
 timestamps:true
});

module.exports =
mongoose.model('OTP',otpSchema);