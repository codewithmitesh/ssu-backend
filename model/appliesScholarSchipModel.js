const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const AppliedScSchema = new mongoose.Schema(
  {
    StudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    StudentData: {
      type: ObjectId,
      ref: "StudentDetails",
    },

    Preferences: {
      type: ObjectId,
      ref: "Preference",
    },
    Status: {
      type: String,
      enum: ["Not Applied", "Applied", "Processing", "Accepted", "Rejected"],
      default: "Not Applied",
    },
    ScholarShipDetails: {
      type: ObjectId,
      ref: "Scholarship",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppliedScholarShip", AppliedScSchema);
