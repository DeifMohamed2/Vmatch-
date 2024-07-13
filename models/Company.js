const mongoose = require('mongoose')
const { required } = require('nodemon/lib/config')
const Schema = mongoose.Schema

const companySchema = new Schema({


    role:{
        type: String,
        required: true,
        default: "org",
    },
    companyName :{
        type: String, 
        required: true, 
    },
    companyCategory :{
        type: String, 
        required: true,  
    },
    password :{
        type : String,
        required: true,
    },
    companySize :{
        type : String,
        required: true,
    },
    companyLocation: {
        street: {
            type: String,
            required: true,
        },
        Apartment: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    companyEmail :{
        type: String, 
        required: true,  
        unique: true,
    },
    companyPhone: {
        type: Number, 
        required: false, 
    },
    companyDescription:{
        type: String,
        required: true,
    },
    companyLogo:{
        type: String,
        required: false,
    },
    companyCover:{
        type: String,
        required: false,
    },
    companySocials:{
        facebook:{
            type: String,
            required: false,
        },
        X:{
            type: String,
            required: false,
        },
        instagram:{
            type: String,
            required: false,
        },
        linkedin:{
            type: String,
            required: false,
        },
    },
    companyAdmins:{
        type: Array,
        required: false,
    },
    companyProjects:{
        type: Array,
        required: false,
    },
    balance: {
        type: Number,
        required: false,
    },
    transactions: {
        type: Object,

        required: false,
        projectName:{
            type: String,
            required: false,
        },
        userEmail:{
            type: String,
            required: false,
        },
        projectPrice:{
            type: Number,
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



const Company = mongoose.model('Company',companySchema)

module.exports=Company;