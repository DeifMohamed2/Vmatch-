const mongoose = require('mongoose')
const { required } = require('nodemon/lib/config')
const Schema = mongoose.Schema

const adminSchema= new Schema({


    role:{
        type: String,
        required: true,
        default: "admin",
    },
    adminName :{
        type: String, 
        required: true, 
    },
    password :{
        type : String,
        required: true,
    },
    adminEmail :{
        type: String, 
        required: true,  
        unique: true,
    },

    balance: {
        type: Number,
        required: false,
    },
    transactions: {
        type: Object,

        required: false,
        companyName:{
            type: String,
            required: false,
        },
        userEmail:{
            type: String,
            required: false,
        },
        feesAmount:{
            type: Number,
            required: false,
        },
        dateOfTransaction:{
            type: Date,
            required: false,
        },
    },
  

    
},{timestamps:true});



const Admin = mongoose.model('Admin',adminSchema)

module.exports=Admin;