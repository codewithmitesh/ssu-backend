const mongoose = require("mongoose")


const refferalSchema = new mongoose.Schema({

    name: String,
    sudentNo:String,
    my_refferalCode: String,
  
  })


module.exports = mongoose.model("myRefferal", refferalSchema)

