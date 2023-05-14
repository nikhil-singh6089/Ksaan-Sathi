// to authenticate logged in user from non logged in user

const catchAsyncErrors = require("../middleware/catchasyncErrors");
const ErrorHander = require("../utils/errorhander");
const jwt = require ("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors( async (req,re,next) => {
    const { token } = req.cookies;

    //console.log(token);

    if(!token){
        return next(new ErrorHander("Please Login to assess this record",401));
    }
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next( new ErrorHander(`Role : ${req.user.role} is not allowed to access this resource`,403));
        }
        next();
    };
};