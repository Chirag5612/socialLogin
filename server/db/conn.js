const mongoose = require("mongoose");

const DB = process.env.DATABASE || 'mongodb+srv://devadmin:ID4devadmin@cluster0.qfbu17e.mongodb.net/socialLogin';

mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=>console.log("database connected")).catch((err)=>console.log("errr",err))