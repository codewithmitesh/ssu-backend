const  User = require("../model/userModel");
const jwt = require("jsonwebtoken")
const AdminModel = require("../model/adminModel");

//==================== authentication ===============================


exports.authentication = function (req, res, next){
try{
    let token = req.headers["x-auth-token"]

if(!token) {return res.status(400).send({status:false , message:" TOKEN REQUIRED"})}

jwt.verify(token , process.env.JWT_SECRET_KEY, async function(err, decoded){

    if(err) {
    return res.status(401).send({status:false , message: err.message})
    }

else {
    req.user = decoded
    req.role = decoded.role
    const role = req.role
    console.log(role)
    next()
}

})
}catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to json OTP" });
  }
}



// ======================= adimin authorizartion ====================


exports.authorization = async (req, res, next )=>{
try{
    let adminData = await AdminModel.findOne({email:req.user.email});
if(!adminData){
    return res.status(400).send({status:false, messsage:"Invalid entry"})
}


    let role = req.role
console.log(role)
    if(role != "admin" && req.user.id != adminData._id){
     return  res.status(403).send({status:false, message:"Unauthorize Access"})
    }
    next()
}catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to json OTP" });
  }
}