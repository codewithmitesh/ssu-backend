const stuData = require("../model/studentDetail");
const ScholarshipModel = require("../model/scholarShipModel");
const AppliedScholarShip = require("../model/appliesScholarSchipModel");

const {
  preferences,
  countryModel,
  coursesModel,
} = require("../model/preferenceModel");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//=========================****** Student Preferences ******===============================================

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//====================== Student create his Preferences ==================================================

exports.studentPref = async (req, res) => {
  try{
  let studentId = req.user._id;

  const check = await stuData.findOne({ StudentId: req.user._id });
  console.log(check.fname);
  const checkPref = await preferences.findOne({ _id: check.PreferencesId});

  // console.log(checkPref)
  // frontend will redirect the user to the next page ... (skip kr dega ) agr ye done h toh ....
  if (checkPref) { 
    return res
      .status(400)
      .json({ status: false, message: "you already filled your Preferences" });
  }
 
  let data = req.body;
  let {
    highestQuali,
    eduLevel,
    marksPercent,
    GPA,
    degree,
    courses,
    country,
    testEnglish,
    testScore,
    StudentId,
  } = data; // mark type will automatically show  i will write logic for that
  StudentId = data.StudentId = studentId;
  if (!highestQuali) {
    return res
      .status(400)
      .json({ status: false, message: "provide your higher Qualification" });
  }
  if (
    ![
      "12TH",
      "UNDERGRADUATE",
      "GRADUATE",
      "POST GRADUATE CERTIFICATE/DIPLOMA",
      "MASTERS DEGREE",
    ].includes(highestQuali)
  ) {
    return res.status(400).json({
      status: false,
      message:
        "you can select any one of these 12TH UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
    });
  }

  if (!eduLevel) {
    return res
      .status(400)
      .json({ status: false, message: "provide your higher education level" });
  }

  if ((!GPA && !marksPercent) || (GPA && marksPercent)) {
    return res
      .status(400)
      .json({ status: false, message: "Provide your only GPA Or Percentage" });
  }

  if (marksPercent) {
    marksPercent = data.marksPercent = `${marksPercent} % `;
  }

  if (!degree) {
    return res
      .status(400)
      .json({ status: false, message: "provide your degree" });
  }
  if (
    ![
      "UNDERGRADUATE",
      "GRADUATE",
      "POST GRADUATE CERTIFICATE/DIPLOMA",
      "MASTERS DEGREE",
    ].includes(degree)
  ) {
    return res.status(400).json({
      status: false,
      message:
        "you can select any one of these UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
    });
  }

  if (!courses) {
    return res
      .status(400)
      .json({ status: false, message: "provide your Area of interest " });
  }

  let checkCourse = await coursesModel.findOne({ courses: courses });
  if (!checkCourse) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid Course entry" });
  }
  if (!country) {
    return res
      .status(400)
      .json({ status: false, message: "Select your desired country " });
  }

  let checkCountry = await countryModel.findOne({ country: country });
  if (!checkCountry) {
    return res.status(400).json({ status: false, message: "Invalid country" });
  }
  // console.log(checkCountry);

  if (!testEnglish) {
    return res
      .status(400)
      .json({ status: false, message: "Select your English Test Subject " });
  }

  if (!["IELTS", "TOEFL", "PTE"].includes(testEnglish)) {
    return res.status(400).json({
      status: false,
      message: "you can select any one of these  IELTS, TOEFL, PTE",
    });
  }
  if (!testScore) {
    return res
      .status(400)
      .json({ status: false, message: "Provide testScore" });
  }

  if (
    testScore[0].reading &&
    testScore[0].writing &&
    testScore[0].listening &&
    testScore[0].speaking &&
    testScore[0].overAll
  ) {
    const savePreferences = await preferences.create(data);

    await stuData.findOneAndUpdate(
      { _id: check._id },
      { PreferencesId: savePreferences._id }
    );

    console.log(savePreferences);
    res.status(201).json({ status: true, data: savePreferences });
  } else if (!testScore[0].englishTestOption) {
    return res.status(400).json({
      status: false,
      message:
        "you have to check mark to submit  or enter your reading, listening , speaking, writing, overAll mark ",
    });
  } else if (testScore[0].englishTestOption) {
    if (!["Yes", "No"].includes(testScore[0].englishTestOption)) {
      return res.status(400).json({
        status: false,
        message: " here you need to provide Only No ",
      });
    } else {
      const savePreferences = await preferences.create(data);
      await stuData.findOneAndUpdate(
        { _id: check._id },
        { PreferencesId: savePreferences._id }
      );

      res.status(201).json({ status: true, data: savePreferences });
    }
  } else {
    return res.status(400).json({
      status: false,
      message:
        "you have to check mark to submit  or enter your reading, listening , speaking, writing, overAll mark ",
    });
  }
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

//////////////////////////////// check if already has prefference /////////

exports.checkstudentPref = async (req, res) => {
  try{
  let check = await preferences.findOne({ StudentId: req.user._id });

  if (check) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(400).json({ status: false });
  }
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================ Student get preferences ===========================================================

exports.getPrefrencsData = async (req, res) => {
  try{
  const studentDataId = await stuData.findOne({ StudentId: req.user._id });
  if (!studentDataId) {
    return res.status(400).json({ status: false, message: "data not found" });
  }
  const studentPref = await preferences.findOne({
    _id: studentDataId.PreferencesId,
  });

  return res.status(200).json({ status: true, data: studentPref });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//========================== get student data by id (admin) ===============================================
/* 
exports.getPrefrencsDataAdmin = async (req, res) => {
  try{
  const userId = req.params.Id;
  if (!userId) {
    return res.status(400).json({
      status: false,
      message: "Please provide student Id in the params to see preferences",
    });
  }
  const prefCheck = await stuData.findOne({ StudentId: userId });

  // need to improve this section ....

  if (!prefCheck.PreferencesId) {
    return res
      .status(400)
      .json({
        status: false,
        message: "No prference is availbale for this student",
      });
  }

  const studentDataId = await stuData.findOne({ StudentId: userId }).populate({
    path: "PreferencesId",
    model: "Preference",
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
  });
  console.log(studentDataId)
  if (!studentDataId) {
    return res.status(400).json({ status: false, message: "data not found" });
  }
  const formattedData = {
    status: true,
    data: {
      _id: studentDataId._id,
      fname: studentDataId.fname,
      lname: studentDataId.lname,
      email: studentDataId.email,
      gender: studentDataId.gender,
      dob: studentDataId.dob,
      state: studentDataId.state,
      district: studentDataId.district,
      refferalCode: studentDataId.refferalCode,
      isVerified: studentDataId.isVerified,
      StudentId: studentDataId.StudentId,
      PreferencesId: {
        _id: studentDataId.PreferencesId._id,
        highestQuali: studentDataId.PreferencesId.highestQuali,
        eduLevel: studentDataId.PreferencesId.eduLevel,
        marksPercent: studentDataId.PreferencesId.marksPercent,
        degree: studentDataId.PreferencesId.degree,
        courses: studentDataId.PreferencesId.courses,
        country: studentDataId.PreferencesId.country,
        testEnglish: studentDataId.PreferencesId.testEnglish,
        testScore: studentDataId.PreferencesId.testScore.map((testScore) => {
          return {
            writing: testScore.writing,
            listening: testScore.listening,
            overAll: testScore.overAll,
            englishTestOption: testScore.englishTestOption,
            _id: testScore._id
          }; 
        }),
        // StudentId: studentDataId.PreferencesId.StudentId,
        ScholarShips: studentDataId.PreferencesId.ScholarShips.map((scholarship) => {
          return {
            // _id: scholarship._id,
            StudentId: scholarship.StudentId,
            // StudentData: scholarship.StudentData,
            // Preferences: scholarship.Preferences,
            Status: scholarship.Status,
            ScholarShipDetails: {
              _id: scholarship.ScholarShipDetails._id,
              Title: scholarship.ScholarShipDetails.Title,
              Amount: scholarship.ScholarShipDetails.Amount,
              Location: scholarship.ScholarShipDetails.Location,
              Description: scholarship.ScholarShipDetails.Description,
              scholarShipCode: scholarship.ScholarShipDetails.scholarShipCode,
              noOfSeats: scholarship.ScholarShipDetails.noOfSeats
            }
          };
        })
      }
    }
  };

  res.status(200).json({status: true , data:formattedData});
} catch (error) {
  res.status(500).json({ status: false, message: error.message });
}
};
 */

// new correct and fromtted data here....

exports.getPrefrencsDataAdmin = async (req, res) => {
  try {
    const userId = req.params.Id;
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "Please provide student Id in the params to see preferences",
      });
    }

    const studentDataId = await preferences
      .findOne({ StudentId: userId })
      .select({ _id: 0, ScholarShips: 0, __v: 0 });
    if (!studentDataId) {
      return res.status(400).json({
        status: false,
        message: "No prference is availbale for this student",
      });
    }

    res.status(200).json({ status: true, data: studentDataId });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ==================================== get all preferences admin ============================================

exports.getAllPreferencesAdmin = async (req, res) => {
  try{
  const allStudentPref = await stuData.find().populate({
    path: "PreferencesId",
    model: "Preference",
    options: { strictPopulate: false },
  });

  res.status(200).json({ status: true, data: allStudentPref });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=================================== update student prefrences ==================================================

exports.updateStudentPref = async (req, res) => {
  try{
  const check = await stuData.findOne({ StudentId: req.user._id });
  // console.log(check);
  const checkPref = await preferences.findOne({ _id: check.PreferencesId });

  console.log(checkPref);

  let data = req.body;
  let {
    highestQuali,
    eduLevel,
    marksPercent,
    GPA,
    degree,
    courses,
    country,
    testEnglish,
    testScore,
    studentData,
  } = data; // mark type will automatically show  i will write logic for that

  if (highestQuali) {
    if (
      ![
        "12TH",
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ].includes(highestQuali)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "you can select any one of these 12TH UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
      });
    }
  }

  if (GPA && marksPercent) {
    return res
      .status(400)
      .json({ status: false, message: "Provide your only GPA Or Percentage" });
  }

  //******** */ if needed then i can improve more  **************
  if (GPA) {
    if (checkPref.marksPercent) {
      return res
        .status(400)
        .json({ status: false, message: "You can Update Your marksPercent" });
    }
  }

  if (marksPercent) {
    if (checkPref.GPA) {
      return res
        .status(400)
        .json({ status: false, message: "You can Update Your GPA" });
    }
  }

  if (marksPercent) {
    marksPercent = data.marksPercent = `${marksPercent} % `;
  }

  if (degree) {
    if (
      ![
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ].includes(degree)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "you can select any one of these UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
      });
    }
  }

  if (courses) {
    let checkCourse = await coursesModel.findOne({ courses: courses });
    if (!checkCourse) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Course entry" });
    }
  }

  if (country) {
    let checkCountry = await countryModel.findOne({ country: country });
    if (!checkCountry) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid country" });
    }
  }

  if (testEnglish) {
    if (!["IELTS", "TOEFL", "PTE"].includes(testEnglish)) {
      return res.status(400).json({
        status: false,
        message: "you can select any one of these  IELTS, TOEFL, PTE",
      });
    }
  }

  // problem no:2 -> if user already filled the data of reading listening writing speaking overall and reading then if want to update
  //  have to write code for that

  if (testScore) {
    if (
      testScore[0].reading &&
      testScore[0].writing &&
      testScore[0].listening &&
      testScore[0].speaking &&
      testScore[0].overAll
    ) {
      if (checkPref.testScore[0].englishTestOption == "No") {
        testScore[0].englishTestOption == "Yes";

        const updatePreferences = await preferences.findOneAndUpdate(
          { _id: checkPref._id },
          { ...data },
          { new: true }
        );

        return res.status(201).json({ status: true, data: updatePreferences });
      }
    } else if (checkPref.testScore[0].englishTestOption == "Yes") {
      if (!testScore[0].reading) {
        testScore[0].reading = checkPref.testScore[0].reading;
      }
      if (!testScore[0].writing) {
        testScore[0].writing = checkPref.testScore[0].writing;
      }
      if (!testScore[0].listening) {
        testScore[0].listening = checkPref.testScore[0].listening;
      }
      if (!testScore[0].speaking) {
        testScore[0].speaking = checkPref.testScore[0].speaking;
      }
      if (!testScore[0].overAll) {
        testScore[0].overAll = checkPref.testScore[0].overAll;
      }

      const updatePreferences = await preferences.findOneAndUpdate(
        { _id: checkPref._id },
        { ...data },
        { new: true }
      );

      return res.status(201).json({ status: true, data: updatePreferences });
    } else if (
      !!testScore[0].reading ||
      !testScore[0].writing ||
      !testScore[0].listening ||
      !testScore[0].speaking ||
      !testScore[0].overAll
    ) {
      testScore[0].englishTestOption = "No";
      const updatePreferences = await preferences.findOneAndUpdate(
        { _id: checkPref._id },
        { ...data },
        { new: true }
      );
      return res.status(201).json({ status: true, data: updatePreferences });
    } else if (checkPref.testScore[0].englishTestOption == "No") {
      testScore[0].englishTestOption = "No";
      const updatePreferences = await preferences.findOneAndUpdate(
        { _id: checkPref._id },
        { ...data },
        { new: true }
      );
      return res.status(201).json({ status: true, data: updatePreferences });
    } else {
      const updatePreferences = await preferences.findOneAndUpdate(
        { _id: checkPref._id },
        { ...data },
        { new: true }
      );
      return res.status(201).json({ status: true, data: updatePreferences });
    }
  }
  const updatePreferences = await preferences.findOneAndUpdate(
    { _id: checkPref._id },
    { ...data },
    { new: true }
  );
  return res.status(201).json({ status: true, data: updatePreferences });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================= Update Student Prefrences By (Admin) =====================================================

// have a look on this ....

exports.updateStudentPrefAdmin = async (req, res) => {
  try{
  const prefId = req.params.prefId;
  const checkPref = await preferences.findById(prefId);
  if (!checkPref) {
    return res
      .status(404)
      .json({ status: false, message: "no data found by this id" });
  }

  console.log(checkPref);

  let data = req.body;
  let {
    highestQuali,
    eduLevel,
    marksPercent,
    GPA,
    degree,
    courses,
    country,
    testEnglish,
    testScore,
    overAll,
    studentData,
  } = data;

  if (highestQuali) {
    if (
      ![
        "12TH",
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ].includes(highestQuali)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "you can select any one of these 12TH UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
      });
    }
  }

  if (GPA && marksPercent) {
    return res
      .status(400)
      .json({ status: false, message: "Provide your only GPA Or Percentage" });
  }

  //******** */  if needed then i can improve more  **************
  if (GPA) {
    if (checkPref.marksPercent) {
      return res.status(400).json({
        status: false,
        message: "You only can Update Your marksPercent",
      });
    }
  }

  if (marksPercent) {
    if (checkPref.GPA) {
      return res
        .status(400)
        .json({ status: false, message: "You only can Update Your GPA" });
    }
  }

  if (marksPercent) {
    marksPercent = data.marksPercent = `${marksPercent} % `;
  }

  if (degree) {
    if (
      ![
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ].includes(degree)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "you can select any one of these UNDERGRADUATE GRADUATE POST GRADUATE CERTIFICATE/DIPLOMA MASTERS DEGREE ",
      });
    }
  }

  if (courses) {
    let checkCourse = await coursesModel.findOne({ courses: courses });
    if (!checkCourse) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Course entry" });
    }
  }

  if (country) {
    let checkCountry = await countryModel.findOne({ country: country });
    if (!checkCountry) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid country" });
    }
  }

  // if (testEnglish) {
  //   if (!["IELTS", "TOEFL", "PTE"].includes(testEnglish)) {
  //     return res.status(400).json({
  //       status: false,
  //       message: "you can select any one of these  IELTS, TOEFL, PTE",
  //     });
  //   }
  // }

  //=======================================
//{ ignore
  //   !!testScore[0].reading ||
  //   !testScore[0].writing ||
  //   !testScore[0].listening ||
  //   !testScore[0].speaking ||
  //   !testScore[0].overAll
  // )
// }
  //=====================================

  // if (testScore) {
  //   console.log(checkPref.testScore[0].englishTestOption);

  //   if (!testScore[0].reading) {
  //     testScore[0].reading = checkPref.testScore[0].reading;
  //   }
  //   if (!testScore[0].writing) {
  //     testScore[0].writing = checkPref.testScore[0].writing;
  //   }
  //   if (!testScore[0].listening) {
  //     testScore[0].listening = checkPref.testScore[0].listening;
  //   }
  //   if (!testScore[0].speaking) {
  //     testScore[0].speaking = checkPref.testScore[0].speaking;
  //   }
  //   if (!testScore[0].overAll) {
  //     testScore[0].overAll = checkPref.testScore[0].overAll;
  //   }
  //   if (testScore[0].englishTestOption) {
  //     if (!["Yes", "No"].includes(testScore[0].englishTestOption)) {
  //       return res.status(400).json({
  //         status: false,
  //         message: "englishTestOption only contains Yes or No ",
  //       });
  //     }
  //   } else if (!testScore[0].englishTestOption) {
  //     testScore[0].englishTestOption = checkPref.testScore[0].englishTestOption;
  //   }

    let updatePreferences = await preferences.findOneAndUpdate(
      { _id: checkPref._id },
      { ...data },
      { new: true }
    );

    res.status(200).json({ status: true, data: updatePreferences });
  }catch(err){
    res.status(500).json({status:false , message:err.message})
  }
}

// }; 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//=============================== delete Preferences by (admin) ======================================================

exports.deletePrefAdmin = async (req, res) => {
  try{
  // delete prefrence by prefrence id ....
  const del = await preferences.findByIdAndDelete(req.params.id);
  if (!del) {
    return res.status(400).json({ status: false, message: "already deleted" });
  }
  res.status(200).json({ status: true, message: "deleted Successfully" });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=============================== ******* recomandation to apply ******* ===========================
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================================== Recomandation =================================================

// have to check that for id

exports.recomandation = async (req, res) => {
  try{
  // student data by the student ID from the request object
  const check = await stuData.findOne({ StudentId: req.user._id });

  //  student's preferences and populate the scholarships data
  const preferenceData = await preferences
    .findById(check.PreferencesId)
    .populate({
      path: "ScholarShips",
      model: "AppliedScholarShip",
      select: {
        _id: 0,
        __v: 0,
        StudentData: 0,
        Preferences: 0,
        updatedAt: 0,
        createdAt: 0,
      }, // exclude _id and __v from ScholarShips
      populate: {
        path: "ScholarShipDetails",
        model: "Scholarship",
        select: { _id: 0, Status: 0, scholarShipCode: 0 },
      },
    })
    .lean();

  // finding the preferences data of the student and selecting the country and scholarships data

  const checkAppliedSc = await preferences
    .findOne({ _id: check.PreferencesId })
    .select({ country: 1, ScholarShips: 1,courses:1 });
if(!checkAppliedSc){
  return res.status(400).json({status:false , message:"No Scholar availble for you right now"})
}
  // find all scholarships that match the student's country
  const scData = await ScholarshipModel.find({
    Location: checkAppliedSc.country,
    areaOfInterest:checkAppliedSc.courses
  }).select({ scholarShipCode: 0 });



  // filter out the applied scholarships from the scholarship data

  const notAppliedSc = scData.filter((scholarship) => {
    const appliedScholarships = preferenceData.ScholarShips.map(
      (appliedSc) => appliedSc.ScholarShipDetails.Title
    );
    return !appliedScholarships.includes(scholarship.Title);
  });

  res.status(200).json({
    status: true,
    message: "Your recommended scholarships are here",
    appliedSc: preferenceData.ScholarShips,
    notAppliedSc,
  })
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

///////////////////////////////////////////////////////////////////////////////////////////
//============================= student apply for scholarship =======================================

/* 
// old 
exports.applyNow = async (req, res) => {

  
  const check = await stuData.findOne({ StudentId: req.user._id });

  console.log(check);
  const checkPref = await preferences.findOne({ _id: check.PreferencesId });

  const ScId = req.params.id;
  let data = req.body;
  data.StudentId = req.user._id;
  const scholar = await ScholarshipModel.findById(ScId);

  if (checkPref.country != scholar.Location) {
    return res.status(400).json({
      status: false,
      message: "This scholarShip is notbelongs to you  ",
    });
  }

  let checkSc = await AppliedScholarShip.findOne({
    StudentData: check._id,
    ScholarShipDetails: ScId,
  });
  if (checkSc) {
    return res.status(400).json({ status: false, message: "Already Applied" });
  }

  let scData = await ScholarshipModel.findById(ScId);
  if (!scData) {
    return res
      .status(404)
      .json({ status: false, message: "Not Schoarship found" });
  }
  StudentData = data.StudentData = check._id;

  Status = data.Status = "Applied";

 let scholarShipDetails = data.ScholarShipDetails = ScId;

 let preferences = data.Preferences = checkPref._id;

  let updatedSc = await AppliedScholarShip.create(data);

  await preferences.findByIdAndUpdate(
    { _id: check.PreferencesId },
    { $push: { ScholarShips: updatedSc._id } },
    { new: true }
  );
  res.status(200).json({
    status: true,
    message: "successfully applied",
    data: updatedSc,
  });
};

 */
//New 
exports.applyNow = async (req, res) => {
  try {
    
    const check = await stuData.findOne({ StudentId: req.user._id });
    if (!check) {
      return res.status(404).json({
        status: false,
        message: "Student data not found",
      });
    }

    // Find the preferences based on the student's PreferencesId
    const checkPref = await preferences.findOne({ _id: check.PreferencesId });
    if (!checkPref) {
      return res.status(404).json({
        status: false,
        message: "Preferences not found",
      });
    }

    const ScId = req.params.id;
    let data = req.body;
    data.StudentId = req.user._id;

   
    const scholar = await ScholarshipModel.findById(ScId);
    if (!scholar) {
      return res.status(404).json({
        status: false,
        message: "Scholarship not found",
      });
    }

    
    if (checkPref.country !== scholar.Location) {
      return res.status(400).json({
        status: false,
        message: "This scholarship does not belong to you",
      });
    }

   
    let checkSc = await AppliedScholarShip.findOne({
      StudentData: check._id,
      ScholarShipDetails: ScId,
    });
    if (checkSc) {
      return res.status(400).json({
        status: false,
        message: "Already applied for this scholarship",
      });
    }

    
    data.StudentData = check._id;
    data.Status = "Applied";
    data.ScholarShipDetails = ScId;
    data.Preferences = checkPref._id;

   
    let updatedSc = await AppliedScholarShip.create(data);

  
    await preferences.findByIdAndUpdate(
      { _id: check.PreferencesId },
      { $push: { ScholarShips: updatedSc._id } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Successfully applied for the scholarship",
      data: updatedSc,
    });
  } catch (error) {
    console.error("Error applying for scholarship:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while applying for the scholarship",
    });
  }
};
 

///////////////////////////////////////////////////////////////////////////////////////////
//====================== get applied scholarShip data with status student ============================================

exports.getAllApliedScholarShip = async (req, res) => {
  try{
  const check = await stuData.findOne({ StudentId: req.user._id });
  // console.log(check)
  // const checkPref = await preferences.findOne({ studentData: check._id })

  let checkSc = await AppliedScholarShip.find({
    StudentData: check._id,
  }).populate({
    path: "ScholarShipDetails",
    model: "Scholarship",
    select: { Status: 0, scholarShipCode: 0 },
  });
  console.log(checkSc);

  res
    .status(200)
    .json({ status: true, message: "ScholarShip details", data: checkSc });
}catch(err){
  res.status(500).json({status:false , message:err.message})
}
};

///////////////////////////////////////////////////////////////////////////////////////////
// ======= admin can update status of Scholarship for any particular user ===================

exports.scStatusUpdate = async (req, res) => {
  try{
  let scholarShipId = req.params.scId;

  let studentId = req.params.stuId;

  let data = req.body;

  let { Status } = data;

  if (
    !["Not Applied", "Applied", "Processing", "Accepted", "Rejected"].includes(
      Status
    )
  ) {
    return res.status(400).json({
      status: false,
      message: "Status should be Applied,Processing,Accepted,Rejected",
    });
  }
  let updateStatus = await AppliedScholarShip.findOneAndUpdate(
    { ScholarShipDetails: scholarShipId, StudentId: studentId },
    { $set: { Status: Status } },
    { new: true }
  );
  res.status(200).json({
    status: true,
    message: "Status Updated Successfully",
    data: updateStatus,
  })
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

////////////////// json ///////////////////////////////////////////
// ========== get all applied scholarShip of a particular user(admin) ======

exports.getAllAppliedSc = async (req, res) => {
  try {
    const studentId = req.params.stuId;
    const allSc = await AppliedScholarShip.find({ StudentId: studentId })
    .populate({
      path: "ScholarShipDetails",
      model: "Scholarship",
      select: { __v: 0 },
    });
    console.log(allSc);
    res.status(200).json({ status: true, data: allSc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};
