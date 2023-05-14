const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,//not selected by find()
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  });


  //happens before saving schema
  userSchema.pre("save", async function(next){
    
    if (!this.isModified("password")){
      next();
    }

    this.password = await bcrypt.hash(this.password,10)
  });

  //JWT tocken

  userSchema.methods.getJWTToken = function (){

    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
      expiresIn:process.env.JWT_EXPIRE,
    });
  };

  // for comparepassword used in login user isPasswordMatched
  userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
  };

  // reset password token generation
  // using inbuild crypto module in node.js
  userSchema.methods.getResetPasswordToken = function () {

    //generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");//for hashing G token

    this.resetPasswordExpire = Date.now() + 15*60*1000;//token expirein 15 min

    return resetToken;

  };


  module.exports = mongoose.model("User", userSchema);