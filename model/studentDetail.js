const mongoose = require("mongoose");

const studentDetailsSchema = new mongoose.Schema({
  
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  lname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  dob: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  refferalCode: {
    type: String,
    default: null,
  },
  isVerified:{
    type:String,
    enum:["Yes", "No"],
    default:"No"
  },
  PreferencesId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Preference"
  },
  StudentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
},{timestamps: true});

module.exports = mongoose.model("StudentDetails", studentDetailsSchema);
