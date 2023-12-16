const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now(), index: { expires: 60*8 } },

    // after 5 min it will be deleted automatically from the database ....
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
