const mongoose = require("mongoose");
// add number of sc
const ScholarshipSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Amount: {
      type: Number,
      required: true,
    },
    Location: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    noOfSeats: {
      type: Number,
      default: 1,
    },

    // areaOfInterest and course are same
    areaOfInterest: {
      type: String,
      required: true,
    },

    scholarShipCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scholarship", ScholarshipSchema);
