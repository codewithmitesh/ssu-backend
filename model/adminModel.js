const mongoose = require("mongoose")

const adminSchema = mongoose.Schema ({
    email:{
        type:String,
    },
    password:{
        type:String
    },
    role:{
        type:String,
        default:"admin"
    }

})

module.exports = mongoose.model("admin", adminSchema)

