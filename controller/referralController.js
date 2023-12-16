

const reffaral = require("../model/refferal")
const User = require("../model/userModel");
const stuData = require("../model/studentDetail");

//////////////////////////////////////////// refferal //////////////////////////////////////////////////

exports.shareRef = async (req, res) => {
  try{
    let data = req.body;
    let userNumber = req.user.number;
  console.log(userNumber)
    // Retrieve user details using req.user._id
    const user = await stuData.findOne({ StudentId: req.user._id });
  
    let checkRef = await reffaral.findOne({sudentNo:userNumber});
    console.log(checkRef);
   
    if (checkRef) {

      const shareLink = {
        // applicationLink: "localhost:3001/student/signup",
        reffralCode: checkRef.my_refferalCode,
      }
  
      return res.status(200).json({ status: true, applicationlink: shareLink });
    } 


    let shortName = user.fname;
    let ref = "";
    for (let i = 0; i < 4; i++) {
      ref += shortName[i];
    }
    let newRef = ref + "@";
    for (let i = 0; i < 4; i++) {
      newRef += userNumber[i];
    }
  
    
    data.name = user.fname;
    data.sudentNo = userNumber;
    data.my_refferalCode = newRef;
  
      const saveref = await reffaral.create(data);
  
      const shareLink = {
        // applicationLink: "localhost:3001/student/signup",
        reffralCode: saveref.my_refferalCode,
      }
      
      res.status(200).json({ status: true, applicationlink: shareLink });
    }catch(err){
      res.status(500).json({status:false , message:err.message})
    }
    
}
  


//////////////////////// check refferal count ////////////////////

exports.countOfMyreferal = async (req, res)=>{
try{
    let userNumber = req.user.number;
  let checkRef = await reffaral.findOne({sudentNo:userNumber});

  const stuRef = await stuData.find({refferalCode:checkRef.my_refferalCode});
console.log(stuRef.length)
res.status(200).json({status:true , totalRef:stuRef.length})
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
} 


 