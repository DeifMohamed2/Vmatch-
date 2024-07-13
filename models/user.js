const { uniq } = require('lodash');
const mongoose = require('mongoose')
const { required } = require('nodemon/lib/config')
const Schema = mongoose.Schema

const userSchema= new Schema({

    role:{
        type: String,
        required: true,
        default: "user",
    },
    userName:{
        type: String, 
        required: true, 
    },
    userEmail:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String, 
        required: true, 
    },

    userGender:{
        type: String,
        required: true,
    },
    userAge : {
        type: String,
        required: true,
    },
    userBio:{
        type: String,
        required: false,
    },
    userLocation: {
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
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
   
    profilePicture:{
        type: String,
        required: false,
    },
    coverPhoto:{
        type: String,
        required: false,
    },

    userSocials:{
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

    userInterests:{
        type: Array,
        required: false,
    },    

    userAppliedProjects:{
        
        type: Object,
        ref : 'Project',
        required: false,
    },

    balance:{
        type: Number,
        required: true,
    },

    transactions:{
        type: Object,

        required: false,
        projectName:{
            type: String,
            required: false,
        },
        projectOwner:{
            type: String,
            required: false,
        },
        projectPrice:{
            type: Number,
            required: false,
        },
        // transactionType:{
        //     type: String,
        //     required: false,
        // },
     
        dateOfTransaction:{
            type: Date,
            required: false,
        },
    },






  
},{timestamps:true});



const User = mongoose.model('User',userSchema)

module.exports=User;