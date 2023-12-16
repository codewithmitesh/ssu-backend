const stuData = require("../model/studentDetail");
const validation = require("../validations/validation");
const User = require("../model/userModel");
const shortid = require("shortid");
const { preferences } = require("../model/preferenceModel");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  ========== student creates his details ============

exports.studentDetails = async (req, res) => {
  try{
  console.log(req.user.number);

  let data = req.body;
  let { fname, lname, email, gender, state, district, refferalCode } = data;

  const check = await stuData.findOne({ studentNo: req.user.number });


  if (check) {
    return res
      .status(400)
      .json({ status: false, message: "you already fill this form" });
  }

  if (!fname) {
    return res
      .status(400)
      .json({ status: false, message: "Please provide your First Name" });
  }
  if (!lname) {
    return res
      .status(400)
      .json({ status: false, message: "Please provide your Last Name" });
  }
  //===============================   email validation =================
  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Please provide your email" });
  }
  const checkEmail = await stuData.findOne({ email: email });
  if (checkEmail) {
    return res
      .status(400)
      .json({ status: false, message: "This email is already exist" });
  }

  if (typeof email != "string")
    return res
      .status(400)
      .json({ status: false, message: "email id  should be in string" });

  email = data.email = email.trim().toLowerCase();
  if (email == "")
    return res
      .status(400)
      .json({ status: false, message: "Please enter email value" });

  if (!validation.validateEmail(email))
    return res
      .status(400)
      .json({ status: false, message: "Please provide valid email id" });

  if (!gender) {
    return res
      .status(400)
      .json({ status: false, message: "Please provide your gender" });
  }

  if (!["Male", "Female", "Other"].includes(gender)) {
    return res.status(400).json({
      status: false,
      message: "please select one of these Male, Female, Other ",
    });
  }

  if (!state) {
    return res
      .status(400)
      .json({ status: false, message: "Please provide your state" });
  }

  if (state) {
    if (!district) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide your district" });
    }
  }

  data.StudentId = req.user._id;

  const saveData = await stuData.create(data);

  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { StudentId: saveData._id }
  );

  res.status(201).json({ status: true, saveData });

}catch(err){
  res.status(500).json({status:false , message:err.message})
}
}
///////////////////////////////////////////////////////////////////////
// check if already filled this form 
exports.checkDetails = async (req, res) => {
  try{
  let check = await stuData.findOne({ StudentId: req.user._id })

  if (check) {
    return res.status(200).json({ status: true })

  } else {

    return res.status(400).json({ status: false })
  }
}catch(err){
  res.status(500).json({status:false , message:err.message})
}

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//=================================== get single student details ==============================================
exports.getSingleStudentData = async (req, res) => {
  try{
  const data = await stuData
    .findOne({ StudentId: req.user._id })
    .select({ isVerified: 0, PreferencesId: 0, StudentId: 0 });

  if (!data) {
    return res.status(404).json({ status: false, message: "No data found" });
  }

  let studentDetails = {
    mobile: req.user.number,
    otherData: data
  }

  res.status(200).json({ status: true, data: studentDetails });
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//================================ get single user data (admin) ==============================================

exports.getSingleStudentDataAdmin = async (req, res) => {
  try{
  const userId = req.params.id;

  const data = await stuData.findOne({ StudentId: userId });
  console.log(data);
  if (!data) {
    return res.status(404).json({ status: false, message: "No data found" });
  }

  res.status(200).json({ status: true, data: data });
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//================================== get all user admin  ======================================================

/* 
//old
exports.getAllStudentData = async (req, res) => {
  let allDataOfStudent = await User.find({})
    .populate({
      path: 'StudentId',
      model: 'StudentDetails',
      select: '-updatedAt -__v',
    })
    .exec();

  if (!allDataOfStudent || allDataOfStudent.length === 0) {
    return res.status(404).json({ status: false, message: "No data found" });
  }

  let studentData = [];
  for (let i = 0; i < allDataOfStudent.length; i++) {
    let student = allDataOfStudent[i];
    let studata = {
      studentNo: student.number,
      _id: student._id,
    };

    if (student.StudentId) {
      studata.studentDetailsId = student.StudentId._id;
      studata.firstName = student.StudentId.fname;
      studata.lastName = student.StudentId.lname;
      studata.email = student.StudentId.email;
      studata.gender = student.StudentId.gender;
      studata.dateOfBirth = student.StudentId.dob;
      studata.state = student.StudentId.state;
      studata.district = student.StudentId.district;
      studata.preferenceId = student.StudentId.PreferencesId;
      studata.verified = student.StudentId.isVerified;
      studata.refferalCode = student.StudentId.refferalCode;
    }

    studentData.push(studata);
  }

  let totalStu = studentData.length;

  res.status(200).json({ status: true, data: studentData, count: totalStu });
};

 */
//============================================================new ==========

exports.getAllStudentData = async (req, res) => {
    try {
      const { fromDate, toDate } = req.body;
      console.log(req.body);
      // if date is missing
      if (!fromDate || !toDate) {
        const data = await User.find()
          .populate({
            path: "StudentId",
            model: "StudentDetails",
            select: "-updatedAt -__v",
            populate: {
              path: "PreferencesId",
              model: "Preference",
              select: "-createdAt -__v",
              options: { strictPopulate: false },
              populate: {
                path: "ScholarShips",
                model: "AppliedScholarShip",
                select: "-__v",
                populate: {
                  path: "ScholarShipDetails",
                  model: "Scholarship",
                  select: "-__v",
                },
              },
            },
          })
          .select("-updatedAt -__v")
          .sort({ createdAt: -1 });
  
        if (data.length === 0) {
          return res.status(404).json({
            status: false,
            message: "No data found.",
          });
        }
  
        // Process and format the data
        const formattedData = data.map(processData);
        return res.status(200).json({
          status: true,
          message: "Success",
          data: formattedData,
        });
      }
  
      const startOfDay = new Date(fromDate + "T00:00:00.000Z");
      const endOfDay = new Date(toDate + "T23:59:59.999Z");
  
      let filterData = await User.find({
        $or: [
          { createdAt: { $gte: startOfDay, $lt: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lt: endOfDay } },
          { "StudentId.createdAt": { $gte: startOfDay, $lt: endOfDay } },
          { "StudentId.updatedAt": { $gte: startOfDay, $lt: endOfDay } },
          {
            "StudentId.PreferencesId.createdAt": {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
          {
            "StudentId.PreferencesId.updatedAt": {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
          {
            "StudentId.PreferencesId.ScholarShips.createdAt": {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
          {
            "StudentId.PreferencesId.ScholarShips.updatedAt": {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
        ],
      })
        .populate({
          path: "StudentId",
          model: "StudentDetails",
          select: "-updatedAt -__v",
          populate: {
            path: "PreferencesId",
            model: "Preference",
            select: "-createdAt -__v",
            options: { strictPopulate: false },
            populate: {
              path: "ScholarShips",
              model: "AppliedScholarShip",
              select: "-__v",
              populate: {
                path: "ScholarShipDetails",
                model: "Scholarship",
                select: "-__v",
              },
            },
          },
        })
        .select("-updatedAt -__v")
        .sort({ createdAt: -1 });
  
      if (filterData.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No data found for the specified date range.",
        });
      }
  
      // Process and format the filtered data

      const formattedData = filterData.map(processData);
      return res.status(200).json({
        status: true,
        message: "Success",
        data: formattedData,
      });
    } catch (e) {
      console.log(e.message);
    }
  };
  
  // Helper function to process and format the data
  
  function processData(data) {

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };



    let allDetails = {
      studentId: data._id,
      number: data.number,
      createdAt: formatDate(data.createdAt),
      studentDetails: {},
      PreferenceDetails: {},
      appliedScholarship: {},
    };
  
    if (data.StudentId) {
      allDetails.studentDetails = {
        studentDetailsId: data.StudentId._id,
        firstName: data.StudentId.fname,
        lastName: data.StudentId.lname,
        email: data.StudentId.email,
        gender: data.StudentId.gender,
        dateOfBirth: data.StudentId.dob,
        state: data.StudentId.state,
        district: data.StudentId.district,
        refferalCode: data.StudentId.refferalCode,
        verified: data.StudentId.isVerified,
      };
  
    
    }
  
    return allDetails;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//===============================  update student ================================================================================

exports.updteDetails = async (req, res) => {
  try{
  let data = req.body;
  let { fname, lname, email, state, district } = data;

  if (email) {
    const checkEmail = await stuData.findOne({ email: email });
    if (checkEmail) {
      return res
        .status(400)
        .json({ status: false, message: "This email is already exist" });
    }

    if (typeof email != "string")
      return res
        .status(400)
        .json({ status: false, message: "email id  should be in string" });

    email = data.email = email.trim().toLowerCase();
    if (email == "")
      return res
        .status(400)
        .json({ status: false, message: "Please enter email value" });

    if (!validation.validateEmail(email))
      return res
        .status(400)
        .json({ status: false, message: "Please provide valid email id" });
  }

  const updateData = await stuData
    .findOneAndUpdate(
      { StudentId: req.user._id },
      {
        $set: {
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          state: data.state,
          district: data.district,
          updatedAt: Date.now()
        },
      },
      { new: true }
    )
    .select({ isVerified: 0, PreferencesId: 0, StudentId: 0 });

  res.status(200).json({ status: true, updateData: updateData });
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//======================= update student details (admin) ===============================
// have to check
exports.updteDetailsAdmin = async (req, res) => {

  //- AKHILESH OLD CODE 
  let sData = req.params.id;
  let data = req.body;
  console.log(sData);
  console.log(data);
  // let { fname, lname, email, state, district, isVerified } = data;

  // if (email) {
  //   const checkEmail = await stuData.findOne({ email: email });
  //   if (checkEmail) {
  //     return res
  //       .status(400)
  //       .json({ status: false, message: "This email is already exist" });
  //   }

  //   if (typeof email != "string")
  //     return res
  //       .status(400)
  //       .json({ status: false, message: "email id  should be in string" });

  //   email = userData.email;
  //   email.trim().toLowerCase();
  //   if (email == "")
  //     return res
  //       .status(400)
  //       .json({ status: false, message: "Please enter email value" });

  //   if (!validation.validateEmail(email))
  //     return res
  //       .status(400)
  //       .json({ status: false, message: "Please provide valid email id" });
  // }

  // if (isVerified) {
  //   if (!["Yes", "No"].includes(isVerified)) {
  //     return res
  //       .status(400)
  //       .json({ status: false, message: "This field contains yes or no" });
  //   }
  // }

  // const updateData = await stuData.findOneAndUpdate(
  //   { StudentId: sData },
  //   {
  //     $set: {
  //       fname: data.fname,
  //       lname: data.lname,
  //       email: data.email,
  //       state: data.state,
  //       district: data.district,
  //       isVerified: data.isVerified,
  //     },
  //   },
  //   { new: true }
  // );

  // res.status(200).json({ status: true, updateData });
  //- MITESH UPDATED CODE

  try {
    let { fname, lname, email, state, district, isVerified } = data;
    if (email) {
      // const checkEmail = await stuData.findOne({ email: email });
      // if (checkEmail) {
      //   return res
      //     .status(400)
      //     .json({ status: false, message: "This email is already exist" });
      // }

      if (typeof email != "string")
        return res
          .status(400)
          .json({ status: false, message: "email id  should be in string" });

      email = data.email = email.trim().toLowerCase();
      if (email == "")
        return res
          .status(400)
          .json({ status: false, message: "Please enter email value" });

      if (!validation.validateEmail(email))
        return res
          .status(400)
          .json({ status: false, message: "Please provide valid email id" });
    }

    if (isVerified) {
      if (!["Yes", "No"].includes(isVerified)) {
        return res
          .status(400)
          .json({ status: false, message: "This field contains yes or no" });
      }
    }

    const updateData = await stuData.findOneAndUpdate(
      { StudentId: sData },
      {
        $set: {
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          state: data.state,
          district: data.district,
          isVerified: data.isVerified,
          refferalCode: data.refferalCode,
          state: data.state,
          gender: data.gender,
          dob: data.dob,
        },
      },
      { new: true }
    );
    // console.log(updateData);
    // console.log(res.body);
    res.status(200).json({ status: true, data: updateData });
  } catch (e) {
    console.log("error in update");
    console.log(e.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//================================= delete student details by admin ==================================

exports.deleteDetailsAdmin = async (req, res) => {
  try {
    let sData = req.params.id;
    console.log(sData);

    const checkDataPref = await stuData.findOne({ StudentId: sData })

    if (!checkDataPref) {
      return res.status(404).json({ status: false, message: "NO data found to delete" })
    }

    let deletedetails = await stuData.findOneAndDelete({ StudentId: sData });
    if (!deletedetails) {
      return res
        .status(400)
        .json({ status: false, message: "this student details Already deleted" });
    }

    await preferences.findByIdAndDelete(checkDataPref.PreferencesId)

    res
      .status(200)
      .json({ status: false, message: " student details deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
};



