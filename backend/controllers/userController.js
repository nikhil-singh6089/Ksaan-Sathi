const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken =require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


//register a user

exports.registerUser = catchAsyncErrors( async (req,res,next) => {

    const { name, email, password } = req.body;

    const user =await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "this is public id",
            url: "profilepic",
        },
    });


    const token = user.getJWTToken();


    res.status(201).json({
        success: true,
        token,
    });
});

//login user
exports.loginUser = catchAsyncErrors ( async (req,res,next) => {
    const { email, password} = req.body;

    //checking is email and password are both given

    if(!email || !password){
        return next(new ErrorHander("Please enter Email & password",400));
    };

    const user = await User.findOne({ email }).select("+password");//await important else copmare function will not be found and error

    if(!user){
        return next(new ErrorHander("Invalid email or password"));
    };

    const isPasswordmatched = await user.comparePassword(password);//await important took a hour of debugging

    if(!isPasswordmatched){
        return next(new ErrorHander("Invalid email or password",401));
    };

    sendToken (user,201,res);
    //mot needed after creating jwttoken.js
    /*const token = user.getJWTToken();


    res.status(200).json({
        success: true,
        token,
    });*/
});

//logout user 

exports.logout = catchAsyncErrors( async (req,res,next) => {

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message: "logged out",
        
    });

});

//forgot pasword

exports.forgotPassword = catchAsyncErrors ( async (req,res,next) => {

    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHander("User not found",404));
    }
    //get reset token 

    const resetToken = user.getResetPasswordToken();

    await user.save({ validatorBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \\n ${resetPasswordUrl} \n\nif you have not requested this email then ,please ignore it `;

    try{
        await sendEmail({
            email:user.email,
            subject:"krishisahayak",
            message: message,
        });

        res.status(200).json({
            success:true,
            message: `Email is send to ${user.email} successfully`,
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHander(error.message,500));
    }

});

//reset password from link given to user

exports.resetPassword = catchAsyncErrors ( async (req,res,next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");//creating hashed from token in user link
    
    const user = await User.findOne({ resetPasswordToken,resetPasswordExpire: {$gt: Date.now()}, });//finding user hashed reset token from userschema with its expiry
    
    //token check
    if(!user){
        return next(new ErrorHander("reset password token invalid or token expired",400));
    }
    //silly check
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password and confirm password dont match"));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);//login user after change

});


//for authenticated users to view ,edit and update thier password

//user details
exports.getUserDetails = catchAsyncErrors( async(req,res,next) => {

    const user = await User.findById(req.user.id);//req.user saves user details by isAutenticated function

    res.status(200).json({
        success:true,
        user,
    });

});
//update passord
exports.updatePassword = catchAsyncErrors( async(req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");//req.user saves user details by isAutenticated function

    const isPasswordmatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordmatched){
        return next(new ErrorHander("old paswword is incorrect",401));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Password and confirm password dont match"));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res)

    //no need 
    /*res.status(200).json({
        success:true,
        user,
    });*/

});

//update user profile
exports.updateProfile = catchAsyncErrors( async(req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };
    //avatar feature latter

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {new: true,runValidators: true, useFindAndModify: false,});

    res.status(200).json({
        success: true,
    })

});

//admin function

//get a list a all user
exports.getAllUser = catchAsyncErrors( async (rq,res,next) => {
    const users = await User.find();//getsall user

    res.status(200).json({
        success: true,
        users,
    });
});

//get a single user
exports.getSingleUser = catchAsyncErrors( async (req,res,next) => {
    const user = await User.findById(req.params.id);//getsall user

    if(!user){
        return next(new ErrorHander(`User with the following id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

//update user role

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
});

//delete user

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    await user.deleteOne();
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
});




