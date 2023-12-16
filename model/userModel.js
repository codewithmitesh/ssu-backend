const mongoose = require("mongoose");


const userSchema = mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    StudentId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"StudentDetails"
    },
    // firebaseUserId: {
    //   type: String,
    //   required: true,
    // },
  }, 

  { timestamps: true }
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================================== genrate token ===================================================
module.exports = mongoose.model("User", userSchema);
