const mongoose = require("mongoose");

const connectDatabase =( )=>{
    mongoose.connect(process.env.DB_URI,{
        useUnifiedTopology: true,
    }).then((data)=>{
        console.log(`Mongodb connected with server: ${data.connection.host}`);
    });/*.catch((err)=>{
        console.log(err)
    })*/ //notneeded as handled in server with unhandled promise
};

module.exports = connectDatabase