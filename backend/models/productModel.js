const mongoose =require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product Name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please Enter product Description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter product Price"],
        maxLength:[6,"Price cannot exceed 6 digits"]
    },
    ratings:{
        type:Number,
        default:0
    },
    // images in cloudmary
    // images are stored as array of object
    // {} defines a object in schema 
    // it is defined in an array cause aproduct can have many images
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"please Enter product category"],

    },
    Stock:{
        type:Number,
        required:[true,"please Enter product Stock volume"],
        maxLength:[4,"Stock cannot exceed 4 digits"],
        default:1
    },
    numofReviews:{
        type:Number,
        default:0
    },
    // same concept as images
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

        
    
})

module.exports=mongoose.model("Product",productSchema);
