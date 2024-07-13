const mongoose = require('mongoose')
const { required } = require('nodemon/lib/config')
const Schema = mongoose.Schema


const projectSchema = new Schema({

    projectName: {
        type: String,
        required: true,
    },
    projectOwner: {
        type: Schema.Types.ObjectId,
        ref: 'Company', 
        required: true,
    },

    projectLocation: {
        street: { type: String },
        city: { type: String },
        country: { type: String }
    },

    projectDate: {
        type: Date,
        required: true,
    },
    projectTimeFrom: {
        type: String,
        required: true,
    },
    projectTimeTo: {
        type: String,
        required: true,
    },
    projectDescription: {
        type: String,
        required: true,
    },
    projectCover: {
        type: String,
        required: true,
    },
 
    projectParticipants: {
        type: Object,
        ref : 'User',
        required: true,
    },
    projectPaymentStatus : {
        type: String,
        required: true,
    },
    projectCategory: {
        type: String,
        required: true,
    },
    projectStatus: {
        type: String,
        required: true,
        default: 'Pending',
    },
    projectDuration: {
        type: String,
        required: false,
    },
    projectPrice: {
        type: Number,
        required: false,
    },
    projectURL: {
        type: String,
        required: false,
    },

    projectCapacity: {
        type: Number,
        required: false,
    },


}, { timestamps: true })



const Project = mongoose.model('Project', projectSchema)

module.exports = Project


