const { coursesModel } = require("../model/preferenceModel");
const ScholarshipModel = require("../model/scholarShipModel");

//////////////////////////////////////////////// Admin /////////////////////////////////////

//===================== create Scholarship ==========================

exports.Scholarships = async (req, res) => {
  try{
  let data = req.body;
  let { Title, Amount, Location, Description, noOfSeats, scholarShipCode,areaOfInterest } = data;
  if (!Title) {
    return res
      .status(400)
      .json({ status: false, message: "please provide title" });
  }
  if (!Amount) {
    return res
      .status(400)
      .json({ status: false, message: "please provide Amount" });
  }
  if (!Location) {
    return res
      .status(400)
      .json({ status: false, message: "please provide Location" });
  }

  if (!Description) {
    return res.status(400).json({
      status: false,
      message: "please provide Description about your Scholarship",
    });
  }

  if (!scholarShipCode) {
    return res.status(400).json({
      status: false,
      message: "please provide scholarShipCode of this Scholarship",
    });
  }


  if (!areaOfInterest) {
    return res.status(400).json({
      status: false,
      message: "please provide areaOfInterest of this Scholarship",
    });
  }

  if(areaOfInterest){
    let checkAreaOfInterest = await coursesModel.findOne({courses:areaOfInterest})
    if(!checkAreaOfInterest){
      return res.status(400).json({
        status: false,
        message: "This Area of Interest is not Available yet.",
      });
    }
  }
const checkSc = await ScholarshipModel.findOne({scholarShipCode:scholarShipCode})

if(checkSc){
  return res.status(400).json({status:false , message:"this sc code is already exist"})
}

  const saveScholarShip = await ScholarshipModel.create(data);
  res.status(201).json({
    status: true,
    message: "Scholarship created successfully",
    data: saveScholarShip,
  });
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};
///////////////////////////////////////////////////////////////////////////////////////////
//============== update scholarShip ===============================

exports.updateScholarship = async (req, res) => {
  try{
  let scholarschipId = req.params.Id;
  let data = req.body;
  const updateScholarShip = await ScholarshipModel.findOneAndUpdate(
    { _id: scholarschipId },
    { ...data },
    { new: true }
  );
  res.status(200).json({
    status: true,
    message: "Scholarship updated successfully",
    data: updateScholarShip,
  })
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};
///////////////////////////////////////////////////////////////////////////////////////////
// ================= get single Scholarschip ======================

exports.getSingleScholarship = async (req, res) => {
  try{
  let scholarschipId = req.params.Id;

  const getScholarShip = await ScholarshipModel.findById(
    scholarschipId
  )

  if (!getScholarShip) {
    return res
      .status(404)
      .json({ status: false, message: "No Scholarship found by this id" });
  }
  res.status(200).json({
    status: true,
    message: " successfull response",
    data: getScholarShip,
  })
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};
///////////////////////////////////////////////////////////////////////////////////////////
// ================= get All Scholarschip =========================

 exports.getAllAdminScholarships = async (req, res) => {
  try{
  let allScholarShips = await ScholarshipModel.find();
  console.log(allScholarShips); 
  if (allScholarShips.length == 0) {
    return res
      .status(404)
      .json({ status: false, message: "No Scholarship found by this id" });
  }
  let count = allScholarShips.length;
  res.status(200).json({
    status: true,
    message: " successfull response",
    data: allScholarShips,
    count:count
  })
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
}; 
///////////////////////////////////////////////////////////////////////////////////////////

//========================== delete ScholarSchip ==================

exports.deleteScholarship = async (req, res) => {
  try{
  let scholarschipId = req.params.Id;

  const delScholarShip = await ScholarshipModel.findOneAndDelete({
    _id: scholarschipId,
  });

  if (!delScholarShip) {
    return res
      .status(404)
      .json({ status: false, message: "No Scholarship found by this id" });
  }
  res.status(200).json({
    status: true,
    message: "Scholarship deleted successfully",
  })
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};
