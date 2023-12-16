const stuData = require("../model/studentDetail");
const jwt = require("jsonwebtoken");
const AdminModel = require("../model/adminModel");
const Scholarship = require("../model/scholarShipModel");
const {
  preferences,
  countryModel,
  coursesModel,
} = require("../model/preferenceModel");
const AppliedScholarship = require("../model/appliesScholarSchipModel");
const exceljs = require("exceljs");
const User = require("../model/userModel");
const cloudinary = require("cloudinary").v2;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//================================== admin log in  ==============================================================

exports.logInAdmin = async (req, res) => {
  try{
  let data = req.body;

  let { email, password } = data;

  let adminData = await AdminModel.findOne({
    email: email,
    password: password,
  });
  if (!adminData) {
    return res
      .status(400)
      .json({ status: false, message: "no document found" });
  }
  console.log(adminData.role);

  let token = jwt.sign(
    { id: adminData._id, role: adminData.role, email: adminData.email },
    process.env.JWT_SECRET_KEY
  );

  res
    .status(200)
    .json({ status: false, message: "logIn success", token: token });
  }catch(err){
    return res.status(500).json({status:false , message:err.message})
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================= add delete get country by admin ======================================================

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ====================================== add country by admin ==================================
exports.addCountry = async (req, res) => {
  try {
    const data = req.body;
    const { country } = data;

    const checkCountry = await countryModel.findOne({ country: country });
    if (checkCountry) {
      return res
        .status(400)
        .json({ status: false, message: "This country already exists" });
    }

    if (!req.files || !req.files.countryIcon) {
      return res
        .status(400)
        .json({ status: false, message: "Country icon is missing" });
    }

    const file = req.files.countryIcon;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "Country_Icon",
    });

    const newCountry = await countryModel.create({
      country,
      countryIcon: {
        public_Id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({ status: true, data: newCountry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================================== remove country by admin ===========================

exports.removeCountry = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(req.query);

    const country = await countryModel.findById(id);

    if (!country) {
      return res
        .status(404)
        .json({ status: false, message: "Country not found" });
    }

    const publicId = country.countryIcon.public_Id;

    const cloudinaryResult = await cloudinary.uploader.destroy(publicId);

    if (cloudinaryResult.result !== "ok") {
      return res
        .status(500)
        .json({
          status: false,
          message: "Failed to remove country icon from Cloudinary",
        });
    }

    await countryModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({
        status: true,
        message: "Country and country icon removed successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================================= get all country admin ==============================

exports.getAllCountry = async (req, res) => {
  try{
  const getAll = await countryModel.find();
  let count = getAll.length;
  res.status(200).json({ status: true, data: getAll, count: count });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ======================= Area of Intrest add remove get by Admin ===================================

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// =============================== add courses by admin ===============================================

exports.addcourses = async (req, res) => {
  try {
    let data = req.body;
    let { courses } = data;
    const checkcourses = await coursesModel.findOne({ courses: courses });
    if (checkcourses) {
      return res
        .status(400)
        .json({ status: false, message: "This course is already exist" });
    }

    if (!req.files || !req.files.courseIcon) {
      return res
        .status(400)
        .json({ status: false, message: "Course icon is missing" });
    }

    const file = req.files.courseIcon;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "Course_Icon",
    });

    const newCourse = await coursesModel.create({
      courses,
      courseIcon: {
        public_Id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({ status: true, data: newCourse });
  } catch (err) {
    res.status(500).json({ status: false, message: err.messsge });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================ remove courses by admin =================================================

exports.removeCourse = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(req.query);

    const isempty = await coursesModel.findById(id);

    if (!isempty) {
      return res
        .status(400)
        .json({ status: false, message: "this course is already deleted " });
    }



    const publicId = isempty.courseIcon.public_Id;

    const cloudinaryResult = await cloudinary.uploader.destroy(publicId);

    if (cloudinaryResult.result !== "ok") {
      return res
        .status(500)
        .json({
          status: false,
          message: "Failed to remove course icon from Cloudinary",
        });
    }

    await coursesModel.findByIdAndDelete(id);
   
      res.status(200).json({ status: true, message: "course successfully removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//============================ get all courses admin =======================================================

exports.getAllcourse = async (req, res) => {
  try{
  const getAll = await coursesModel.find();
  let count = getAll.length;
  if (getAll.length == 0) {
    return res
      .status(400)
      .json({ status: false, message: "there is no courses present " });
  }
  res.status(200).json({ status: true, data: getAll, count: count });
}catch(err){
  return res.status(500).json({status:false , message:err.message})
}
};


// ====================================  export studata , preferences , scholarship data of sudent ==================
// have to delete
exports.studentExcel = async (req, res) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  worksheet.columns = [
    { header: "S No.", key: "s_no" },
    { header: "First Name", key: "fname" },
    { header: "Last Name", key: "lname" },
    { header: "Email", key: "email" },
    { header: "Gender", key: "gender" },
    { header: "DOB", key: "dob" },
    { header: "State", key: "state" },
    { header: "District", key: "district" },
    { header: "Student No", key: "studentNo" },
  ];

  let counter = 1;
  const studentData = await stuData.find();

  studentData.forEach((student) => {
    student.s_no = counter; // add a counter for each student
    worksheet.addRow(student); // add the student data to the worksheet
    counter++;
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

  workbook.xlsx
    .write(res)
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      console.log(err);
    });
};

//====================== get all data of student ======================

///////////////////////////////////////////

//=====================================  new new new excel all data conversion from date to date ============================

////////////////// phle wala jisme 1 hi sc aa rha tha //////////////////////////////////////////////////
/* 
exports.getAllData = async (req, res) => {
  try{
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({
      status: false,
      message: "Starting and ending dates are missing.",
    });
  }

  const workbook = new exceljs.Workbook();

  const sheet = workbook.addWorksheet("Preferences");
  // define the columns
  sheet.columns = [
    { header: "S No.", key: "s_no" },
    { header: "Student Number", key: "number" },
    { header: "Verified", key: "isVerified" },
    { header: "First Name", key: "fname" },
    { header: "Last Name", key: "lname" },
    { header: "Email", key: "email" },
    { header: "Gender", key: "gender" },
    { header: "Date of Birth", key: "dob" },
    { header: "State", key: "state" },
    { header: "District", key: "district" },
    { header: "Refferal", key: "refferalCode" },

    { header: "Highest Qualification", key: "highestQuali" },
    { header: "Education Level", key: "eduLevel" },
    { header: "GPA", key: "GPA" },
    { header: "Marks %", key: "marksPercent" },
    { header: "Degree", key: "degree" },
    { header: "Courses", key: "courses" },
    { header: "Country", key: "country" },
    { header: "English Test", key: "testEnglish" },

    { header: "Yes/No", key: "englishTestOption" },
    { header: "Overall", key: "overall" },
    { header: "Speaking", key: "speaking" },
    { header: "Listening", key: "listening" },
    { header: "Reading", key: "reading" },
    { header: "Writing", key: "writing" },

    { header: "Scholarship code", key: "scholarShipCode" },
    { header: "Scholarship Status", key: "Status" },
  ];

  //================== populated data ======================

  const startOfDay = new Date(fromDate + "T00:00:00.000Z");
  const endOfDay = new Date(toDate + "T23:59:59.999Z");

  let counter = 1;

  let allDataOfStudent = await User.find({
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
    .select("-updatedAt -__v");

  console.log(allDataOfStudent);

  //=========================================
  // populate the data

  allDataOfStudent.forEach((stu) => {
    stu.s_no = counter;

    sheet.addRow({
      // student info
      s_no: stu.s_no,
      number: stu.number,
      isVerified: stu.StudentId?.isVerified ?? "",
      fname: stu.StudentId?.fname ?? "",
      lname: stu.StudentId?.lname ?? "",
      email: stu.StudentId?.email ?? "",
      gender: stu.StudentId?.gender ?? "",
      dob: stu.StudentId?.dob ?? "",
      state: stu.StudentId?.state ?? "",
      district: stu.StudentId?.district ?? "",
      refferalCode: stu.StudentId?.refferalCode ?? "",

      // preferences
      highestQuali: stu.StudentId?.PreferencesId?.highestQuali ?? "",
      eduLevel: stu.StudentId?.PreferencesId?.eduLevel ?? "",
      GPA: stu.StudentId?.PreferencesId?.GPA ?? "",
      marksPercent: stu.StudentId?.PreferencesId?.marksPercent ?? "",
      degree: stu.StudentId?.PreferencesId?.degree ?? "",
      courses: stu.StudentId?.PreferencesId?.courses ?? "",
      country: stu.StudentId?.PreferencesId?.country ?? "",
      testEnglish: stu.StudentId?.PreferencesId?.testEnglish ?? "",
      reading: stu.StudentId?.PreferencesId?.testScore?.[0]?.reading ?? "",
      writing: stu.StudentId?.PreferencesId?.testScore?.[0]?.writing ?? "",
      listening: stu.StudentId?.PreferencesId?.testScore?.[0]?.listening ?? "",
      speaking: stu.StudentId?.PreferencesId?.testScore?.[0]?.speaking ?? "",
      overall: stu.StudentId?.PreferencesId?.testScore?.[0]?.overAll ?? "",
      englishTestOption:
        stu.StudentId?.PreferencesId?.testScore?.[0]?.englishTestOption ?? "",

      // scholarship
      scholarShipCode:
        stu.StudentId?.PreferencesId?.ScholarShips?.[0]?.ScholarShipDetails
          ?.scholarShipCode ?? "",
      Status: stu.StudentId?.PreferencesId?.ScholarShips?.[0]?.Status ?? "",
    });

    counter++;
  });

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

  workbook.xlsx
    .write(res)
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      console.log(err);
    });
  }catch(err){
    return res.status(500).json({status:false , message:err.message})
  }
}

 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/* 
exports.getAllData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        status: false,
        message: "Starting and ending dates are missing.",
      });
    }

    const workbook = new exceljs.Workbook();

    const sheet = workbook.addWorksheet("Preferences");
    // define the columns
    sheet.columns = [
      { header: "S No.", key: "s_no" },
      {header:"CreatedAt", key:"createdAt"},
      { header: "Student Number", key: "number" },
      { header: "Verified", key: "isVerified" },
      { header: "First Name", key: "fname" },
      { header: "Last Name", key: "lname" },
      { header: "Email", key: "email" },
      { header: "Gender", key: "gender" },
      { header: "Date of Birth", key: "dob" },
      { header: "State", key: "state" },
      { header: "District", key: "district" },
      { header: "Refferal", key: "refferalCode" },

      { header: "Highest Qualification", key: "highestQuali" },
      { header: "Education Level", key: "eduLevel" },
      { header: "GPA", key: "GPA" },
      { header: "Marks %", key: "marksPercent" },
      { header: "Degree", key: "degree" },
      { header: "Courses", key: "courses" },
      { header: "Country", key: "country" },
      { header: "English Test", key: "testEnglish" },

      { header: "Yes/No", key: "englishTestOption" },
      { header: "Overall", key: "overall" },
      { header: "Speaking", key: "speaking" },
      { header: "Listening", key: "listening" },
      { header: "Reading", key: "reading" },
      { header: "Writing", key: "writing" },

      { header: "Scholarship code", key: "scholarShipCode" },
      { header: "Scholarship Status", key: "Status" },
    ];

    //================== populated data ======================

    const startOfDay = new Date(fromDate + "T00:00:00.000Z");
    const endOfDay = new Date(toDate + "T23:59:59.999Z");

    let counter = 1;

    let allDataOfStudent = await User.find({
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
      .select("-updatedAt -__v");

    console.log(allDataOfStudent);

    //=========================================
    // populate the data

   // ...

  // ...
  const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };



allDataOfStudent.forEach((stu) => {
  stu.s_no = counter;

  
  const preferences = stu.StudentId?.PreferencesId ?? {};


  const scholarships = preferences.ScholarShips ?? [];

  if (scholarships.length > 0) {
    const studentData = {
      // student info
      s_no: counter,
      number: stu.number,
      createdAt:stu.createdAt,
      isVerified: stu.StudentId?.isVerified ?? "",
      fname: stu.StudentId?.fname ?? "",
      lname: stu.StudentId?.lname ?? "",
      email: stu.StudentId?.email ?? "",
      gender: stu.StudentId?.gender ?? "",
      dob: stu.StudentId?.dob ?? "",
      state: stu.StudentId?.state ?? "",
      district: stu.StudentId?.district ?? "",
      refferalCode: stu.StudentId?.refferalCode ?? "",

      // preferences
      highestQuali: preferences.highestQuali ?? "",
      eduLevel: preferences.eduLevel ?? "",
      GPA: preferences.GPA ?? "",
      marksPercent: preferences.marksPercent ?? "",
      degree: preferences.degree ?? "",
      courses: preferences.courses ?? "",
      country: preferences.country ?? "",
      testEnglish: preferences.testEnglish ?? "",
      reading: preferences.testScore?.[0]?.reading ?? "",
      writing: preferences.testScore?.[0]?.writing ?? "",
      listening: preferences.testScore?.[0]?.listening ?? "",
      speaking: preferences.testScore?.[0]?.speaking ?? "",
      overall: preferences.testScore?.[0]?.overAll ?? "",
      englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",
    };

    scholarships.forEach((scholarship, index) => {
      const scholarshipData = {
        // scholarship
        scholarShipCode: scholarship.ScholarShipDetails?.scholarShipCode ?? "",
        Status: scholarship.Status ?? "",
      };

      sheet.addRow({ ...studentData, ...scholarshipData });
      counter++;
    });
  } else {
    // Add a row with empty scholarship data
    sheet.addRow({
      // student info
      s_no: counter,
      number: stu.number,
      isVerified: stu.StudentId?.isVerified ?? "",
      fname: stu.StudentId?.fname ?? "",
      lname: stu.StudentId?.lname ?? "",
      email: stu.StudentId?.email ?? "",
      gender: stu.StudentId?.gender ?? "",
      dob: stu.StudentId?.dob ?? "",
      state: stu.StudentId?.state ?? "",
      district: stu.StudentId?.district ?? "",
      refferalCode: stu.StudentId?.refferalCode ?? "",

      // preferences
      highestQuali: preferences.highestQuali ?? "",
      eduLevel: preferences.eduLevel ?? "",
      GPA: preferences.GPA ?? "",
      marksPercent: preferences.marksPercent ?? "",
      degree: preferences.degree ?? "",
      courses: preferences.courses ?? "",
      country: preferences.country ?? "",
      testEnglish: preferences.testEnglish ?? "",
      reading: preferences.testScore?.[0]?.reading ?? "",
      writing: preferences.testScore?.[0]?.writing ?? "",
      listening: preferences.testScore?.[0]?.listening ?? "",
      speaking: preferences.testScore?.[0]?.speaking ?? "",
      overall: preferences.testScore?.[0]?.overAll ?? "",
      englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",

      // scholarship (empty data)
      scholarShipCode: "",
      Status: "",
    });

    counter++;
  }
});

// ...

  
// ...

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    workbook.xlsx
      .write(res)
      .then(() => {
        res.status(200).end();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
   console.log(err.message)
res.status(500).json({status:false ,message:err.message})
  }
}


 */




//////////////////////////////////// each field should have created At /////////////////////////////
// for createdAt
/* 

exports.getAllData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        status: false,
        message: "Starting and ending dates are missing.",
      });
    }

    const workbook = new exceljs.Workbook();

    const sheet = workbook.addWorksheet("Preferences");
    // define the columns
    sheet.columns = [
      { header: "S No.", key: "s_no" },
      { header: "CreatedAt", key: "createdAt" },
      { header: "UpdatedAt", key: "updatedAt" },
      { header: "Student Number", key: "number" },
      { header: "Verified", key: "isVerified" },
      { header: "First Name", key: "fname" },
      { header: "Last Name", key: "lname" },
      { header: "Email", key: "email" },
      { header: "Gender", key: "gender" },
      { header: "Date of Birth", key: "dob" },
      { header: "State", key: "state" },
      { header: "District", key: "district" },
      { header: "Refferal", key: "refferalCode" },

      { header: "Highest Qualification", key: "highestQuali" },
      { header: "Education Level", key: "eduLevel" },
      { header: "GPA", key: "GPA" },
      { header: "Marks %", key: "marksPercent" },
      { header: "Degree", key: "degree" },
      { header: "Courses", key: "courses" },
      { header: "Country", key: "country" },
      { header: "English Test", key: "testEnglish" },

      { header: "Yes/No", key: "englishTestOption" },
      { header: "Overall", key: "overall" },
      { header: "Speaking", key: "speaking" },
      { header: "Listening", key: "listening" },
      { header: "Reading", key: "reading" },
      { header: "Writing", key: "writing" },

      { header: "Scholarship code", key: "scholarShipCode" },
      { header: "Scholarship Status", key: "Status" },
    ];

    //================== populated data ======================

    const startOfDay = new Date(fromDate + "T00:00:00.000Z");
    const endOfDay = new Date(toDate + "T23:59:59.999Z");

    let counter = 1;

    let allDataOfStudent = await User.find({
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
      .select("-updatedAt -__v");

    // Format the date as DD/MM/YYYY
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    allDataOfStudent.forEach((stu) => {
      stu.s_no = counter;

      const preferences = stu.StudentId?.PreferencesId ?? {};

      const scholarships = preferences.ScholarShips ?? [];

      if (scholarships.length > 0) {
        const studentData = {
          s_no: counter,
          number: stu.number,
          createdAt: formatDate(stu.createdAt), // Format the createdAt date
          isVerified: stu.StudentId?.isVerified ?? "",
          fname: stu.StudentId?.fname ?? "",
          lname: stu.StudentId?.lname ?? "",
          email: stu.StudentId?.email ?? "",
          gender: stu.StudentId?.gender ?? "",
          dob: stu.StudentId?.dob ?? "",
          state: stu.StudentId?.state ?? "",
          district: stu.StudentId?.district ?? "",
          refferalCode: stu.StudentId?.refferalCode ?? "",

          highestQuali: preferences.highestQuali ?? "",
          eduLevel: preferences.eduLevel ?? "",
          GPA: preferences.GPA ?? "",
          marksPercent: preferences.marksPercent ?? "",
          degree: preferences.degree ?? "",
          courses: preferences.courses ?? "",
          country: preferences.country ?? "",
          testEnglish: preferences.testEnglish ?? "",
          reading: preferences.testScore?.[0]?.reading ?? "",
          writing: preferences.testScore?.[0]?.writing ?? "",
          listening: preferences.testScore?.[0]?.listening ?? "",
          speaking: preferences.testScore?.[0]?.speaking ?? "",
          overall: preferences.testScore?.[0]?.overAll ?? "",
          englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",
        };

        scholarships.forEach((scholarship, index) => {
          const scholarshipData = {
            scholarShipCode:
              scholarship.ScholarShipDetails?.scholarShipCode ?? "",
            Status: scholarship.Status ?? "",
          };

          sheet.addRow({ ...studentData, ...scholarshipData });
          counter++;
        });
      } else {
        // Add a row with empty scholarship data
        sheet.addRow({
          s_no: counter,
          number: stu.number,
          createdAt: formatDate(stu.createdAt), // Format the createdAt date
          isVerified: stu.StudentId?.isVerified ?? "",
          fname: stu.StudentId?.fname ?? "",
          lname: stu.StudentId?.lname ?? "",
          email: stu.StudentId?.email ?? "",
          gender: stu.StudentId?.gender ?? "",
          dob: stu.StudentId?.dob ?? "",
          state: stu.StudentId?.state ?? "",
          district: stu.StudentId?.district ?? "",
          refferalCode: stu.StudentId?.refferalCode ?? "",

          highestQuali: preferences.highestQuali ?? "",
          eduLevel: preferences.eduLevel ?? "",
          GPA: preferences.GPA ?? "",
          marksPercent: preferences.marksPercent ?? "",
          degree: preferences.degree ?? "",
          courses: preferences.courses ?? "",
          country: preferences.country ?? "",
          testEnglish: preferences.testEnglish ?? "",
          reading: preferences.testScore?.[0]?.reading ?? "",
          writing: preferences.testScore?.[0]?.writing ?? "",
          listening: preferences.testScore?.[0]?.listening ?? "",
          speaking: preferences.testScore?.[0]?.speaking ?? "",
          overall: preferences.testScore?.[0]?.overAll ?? "",
          englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",
          scholarShipCode: "",
          Status: "",
        });
        counter++;
      }
    });

    // Generate the Excel file
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    workbook.xlsx
      .write(res)
      .then(() => {
        res.status(200).end();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
   console.log(err.message)
res.status(500).json({status:false ,message:err.message})
  }
}
 */


/////////////////////////////////// for createdAt and UpdatedAt working ///////////////////////////////////////////////////////

exports.getAllData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        status: false,
        message: "Starting and ending dates are missing.",
      });
    }

    const workbook = new exceljs.Workbook();

    const sheet = workbook.addWorksheet("Preferences");
    // define the columns
    sheet.columns = [
      { header: "S No.", key: "s_no" },
      { header: "CreatedAt", key: "createdAt" },
      { header: "UpdatedAt", key: "updatedAt" },
      { header: "Student Number", key: "number" },
      { header: "Verified", key: "isVerified" },
      { header: "First Name", key: "fname" },
      { header: "Last Name", key: "lname" },
      { header: "Email", key: "email" },
      { header: "Gender", key: "gender" },
      { header: "Date of Birth", key: "dob" },
      { header: "State", key: "state" },
      { header: "District", key: "district" },
      { header: "Refferal", key: "refferalCode" },

      { header: "Highest Qualification", key: "highestQuali" },
      { header: "Education Level", key: "eduLevel" },
      { header: "GPA", key: "GPA" },
      { header: "Marks %", key: "marksPercent" },
      { header: "Degree", key: "degree" },
      { header: "Courses", key: "courses" },
      { header: "Country", key: "country" },
      { header: "English Test", key: "testEnglish" },

      { header: "Yes/No", key: "englishTestOption" },
      { header: "Overall", key: "overall" },
      { header: "Speaking", key: "speaking" },
      { header: "Listening", key: "listening" },
      { header: "Reading", key: "reading" },
      { header: "Writing", key: "writing" },

      { header: "Scholarship code", key: "scholarShipCode" },
      { header: "Scholarship Status", key: "Status" },
    ];

    //================== populated data ======================

    const startOfDay = new Date(fromDate + "T00:00:00.000Z");
    const endOfDay = new Date(toDate + "T23:59:59.999Z");

    let counter = 1;

    let allDataOfStudent = await User.find({
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
        select: " -__v",
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
      .select("-__v");

    // Format the date as DD/MM/YYYY
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    allDataOfStudent.forEach((stu) => {
      stu.s_no = counter;

      const preferences = stu.StudentId?.PreferencesId ?? {};

      const scholarships = preferences.ScholarShips ?? [];

      let maxUpdatedAt = Math.max(
        new Date(stu.updatedAt).getTime(),
        stu.StudentId?.updatedAt ? new Date(stu.StudentId.updatedAt).getTime() : 0,
        stu.StudentId?.PreferencesId?.updatedAt
          ? new Date(stu.StudentId.PreferencesId.updatedAt).getTime()
          : 0
      );
      
      if (stu.StudentId?.PreferencesId?.ScholarShips) {
        stu.StudentId.PreferencesId.ScholarShips.forEach((scholarship) => {
          const scholarshipUpdatedAt = scholarship.updatedAt
            ? new Date(scholarship.updatedAt).getTime()
            : 0;
          maxUpdatedAt = Math.max(maxUpdatedAt, scholarshipUpdatedAt);
          if (scholarship.ScholarShipDetails) {
            const scholarShipDetailsUpdatedAt = scholarship.ScholarShipDetails.updatedAt
              ? new Date(scholarship.ScholarShipDetails.updatedAt).getTime()
              : 0;
            maxUpdatedAt = Math.max(maxUpdatedAt, scholarShipDetailsUpdatedAt);
          }
        });
      }
      
      if (maxUpdatedAt === 0) {
        return; 
      }
      

      if (stu.StudentId?.PreferencesId?.ScholarShips) {
        stu.StudentId.PreferencesId.ScholarShips.forEach((scholarship) => {
          const scholarshipUpdatedAt =
            scholarship.updatedAt.getTime() ?? 0;
          maxUpdatedAt = Math.max(maxUpdatedAt, scholarshipUpdatedAt);
          if (scholarship.ScholarShipDetails) {
            const scholarShipDetailsUpdatedAt =
              scholarship.ScholarShipDetails.updatedAt.getTime() ?? 0;
            maxUpdatedAt = Math.max(
              maxUpdatedAt,
              scholarShipDetailsUpdatedAt
            );
          }
        });
      }

      if (maxUpdatedAt === 0) {
        return; // Skip if no updatedAt value found
      }

      if (scholarships.length > 0) {
        const studentData = {
          s_no: counter,
          number: stu.number,
          createdAt: formatDate(stu.createdAt), // Format the createdAt date
          updatedAt: formatDate(new Date(maxUpdatedAt)), // Format the updatedAt date
          isVerified: stu.StudentId?.isVerified ?? "",
          fname: stu.StudentId?.fname ?? "",
          lname: stu.StudentId?.lname ?? "",
          email: stu.StudentId?.email ?? "",
          gender: stu.StudentId?.gender ?? "",
          dob: stu.StudentId?.dob ?? "",
          state: stu.StudentId?.state ?? "",
          district: stu.StudentId?.district ?? "",
          refferalCode: stu.StudentId?.refferalCode ?? "",

          highestQuali: preferences.highestQuali ?? "",
          eduLevel: preferences.eduLevel ?? "",
          GPA: preferences.GPA ?? "",
          marksPercent: preferences.marksPercent ?? "",
          degree: preferences.degree ?? "",
          courses: preferences.courses ?? "",
          country: preferences.country ?? "",
          testEnglish: preferences.testEnglish ?? "",
          reading: preferences.testScore?.[0]?.reading ?? "",
          writing: preferences.testScore?.[0]?.writing ?? "",
          listening: preferences.testScore?.[0]?.listening ?? "",
          speaking: preferences.testScore?.[0]?.speaking ?? "",
          overall: preferences.testScore?.[0]?.overAll ?? "",
          englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",
        };

        scholarships.forEach((scholarship, index) => {
          const scholarshipData = {
            scholarShipCode:
              scholarship.ScholarShipDetails?.scholarShipCode ?? "",
            Status: scholarship.Status ?? "",
          };

          sheet.addRow({ ...studentData, ...scholarshipData });
          counter++;
        });
      } else {
        // Add a row with empty scholarship data
        sheet.addRow({
          s_no: counter,
          number: stu.number,
          createdAt: formatDate(stu.createdAt), // Format the createdAt date
          updatedAt: formatDate(new Date(maxUpdatedAt)), // Format the updatedAt date
          isVerified: stu.StudentId?.isVerified ?? "",
          fname: stu.StudentId?.fname ?? "",
          lname: stu.StudentId?.lname ?? "",
          email: stu.StudentId?.email ?? "",
          gender: stu.StudentId?.gender ?? "",
          dob: stu.StudentId?.dob ?? "",
          state: stu.StudentId?.state ?? "",
          district: stu.StudentId?.district ?? "",
          refferalCode: stu.StudentId?.refferalCode ?? "",

          highestQuali: preferences.highestQuali ?? "",
          eduLevel: preferences.eduLevel ?? "",
          GPA: preferences.GPA ?? "",
          marksPercent: preferences.marksPercent ?? "",
          degree: preferences.degree ?? "",
          courses: preferences.courses ?? "",
          country: preferences.country ?? "",
          testEnglish: preferences.testEnglish ?? "",
          reading: preferences.testScore?.[0]?.reading ?? "",
          writing: preferences.testScore?.[0]?.writing ?? "",
          listening: preferences.testScore?.[0]?.listening ?? "",
          speaking: preferences.testScore?.[0]?.speaking ?? "",
          overall: preferences.testScore?.[0]?.overAll ?? "",
          englishTestOption: preferences.testScore?.[0]?.englishTestOption ?? "",
          scholarShipCode: "",
          Status: "",
        });
        counter++;
      }
    });

    // Generate the Excel file
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    workbook.xlsx
      .write(res)
      .then(() => {
        res.status(200).end();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ status: false, message: err.message });
  }
};




///////////////////////////////////////////////////////////////////////////////////////////////////////////



//=========== get all Student data by date filter ===========


//   it is also working 
//  new data to show ....

// this is what that is fullfill the requirement ...

exports.getAllStudentDataDatewise = async (req, res) => {
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
  let allDetails = {
    studentId: data._id,
    number: data.number,
    studentDetails: {},
    PreferenceDetails: {},
    appliedScholarship: [],
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

    if (data.StudentId.PreferencesId) {
      let preference = data.StudentId.PreferencesId;
      allDetails.PreferenceDetails = {
        PreferencesId: preference._id,
        higestQualification: preference.highestQuali,
        educationLevel: preference.eduLevel,
        degree: preference.degree,
        areaOfInterest: preference.courses,
        country: preference.country,
        englishTest: preference.testEnglish,
      };

      if (preference.marksPercent) {
        allDetails.PreferenceDetails.markPercentage = preference.marksPercent;
      } else {
        allDetails.PreferenceDetails.GPA = preference.GPA;
      }

      let score = preference.testScore;

      if (score && score.length > 0) {
        allDetails.PreferenceDetails.englishTestScore = {
          writing: score[0].writing ?? null,
          listening: score[0].listening ?? null,
          reading: score[0].reading ?? null,
          speaking: score[0].speaking ?? null,
          overAll: score[0].overAll ?? null,
        };
      }
    }

    if (
      data.StudentId.PreferencesId &&
      data.StudentId.PreferencesId.ScholarShips
    ) {
      let appliedScholarships = data.StudentId.PreferencesId.ScholarShips;

      allDetails.appliedScholarship = appliedScholarships.map((scholarship) => {
        const scholarShipDetails = scholarship.ScholarShipDetails || {};
        const scholarShipCode = scholarShipDetails.scholarShipCode || {};

        return {
          scholarShipId: scholarShipDetails._id ?? null,
          title: scholarShipDetails.Title ?? null,
          description: scholarShipDetails.Description ?? null,
          amount: scholarShipDetails.Amount ?? null,
          location: scholarShipDetails.Location ?? null,
          status: scholarship.Status ?? null,
          noOfSeats: scholarShipDetails.noOfSeats ?? null,
          scholarShipCode: scholarShipCode ?? null,
        };
      });
    }
  }

  return allDetails;
}


//============================================






// working code running great 
/* 
exports.getAllStudentDataDatewise = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

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
    //  return res.json({data})
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
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Define the processData function

const processData = (data) => {
  const formattedData = {
    s_no: data.s_no,
    number: data.number,
    isVerified: data.StudentId?.isVerified ?? "",
    fname: data.StudentId?.fname ?? "",
    lname: data.StudentId?.lname ?? "",
    email: data.StudentId?.email ?? "",
    gender: data.StudentId?.gender ?? "",
    dob: data.StudentId?.dob ?? "",
    state: data.StudentId?.state ?? "",
    district: data.StudentId?.district ?? "",
    refferalCode: data.StudentId?.refferalCode ?? "",
    preference: {
      highestQuali: data.StudentId?.PreferencesId?.highestQuali ?? "",
      eduLevel: data.StudentId?.PreferencesId?.eduLevel ?? "",
      GPA: data.StudentId?.PreferencesId?.GPA ?? "",
      marksPercent: data.StudentId?.PreferencesId?.marksPercent ?? "",
      degree: data.StudentId?.PreferencesId?.degree ?? "",
      courses: data.StudentId?.PreferencesId?.courses ?? "",
      country: data.StudentId?.PreferencesId?.country ?? "",
      testEnglish: data.StudentId?.PreferencesId?.testEnglish ?? "",
      reading: data.StudentId?.PreferencesId?.testScore?.[0]?.reading ?? "",
      writing: data.StudentId?.PreferencesId?.testScore?.[0]?.writing ?? "",
      listening: data.StudentId?.PreferencesId?.testScore?.[0]?.listening ?? "",
      speaking: data.StudentId?.PreferencesId?.testScore?.[0]?.speaking ?? "",
      overall: data.StudentId?.PreferencesId?.testScore?.[0]?.overAll ?? "",
      englishTestOption:
        data.StudentId?.PreferencesId?.testScore?.[0]?.englishTestOption ?? "",
    },
    scData: data.StudentId?.PreferencesId?.ScholarShips?.map((scholarship) => ({
      _id: scholarship._id ?? "",
      StudentId: scholarship.StudentId ?? "",
      StudentData: scholarship.StudentData ?? "",
      Preferences: scholarship.Preferences ?? "",
      Status: scholarship.Status ?? "",
      ScholarShipDetails: {
        _id: scholarship.ScholarShipDetails?._id ?? "",
        Title: scholarship.ScholarShipDetails?.Title ?? "",
        Amount: scholarship.ScholarShipDetails?.Amount ?? 0,
        Location: scholarship.ScholarShipDetails?.Location ?? "",
        Description: scholarship.ScholarShipDetails?.Description ?? "",
        noOfSeats: scholarship.ScholarShipDetails?.noOfSeats ?? 0,
        scholarShipCode: scholarship.ScholarShipDetails?.scholarShipCode ?? "",
        createdAt: scholarship.ScholarShipDetails?.createdAt ?? "",
        updatedAt: scholarship.ScholarShipDetails?.updatedAt ?? "",
      },
      createdAt: scholarship.createdAt ?? "",
      updatedAt: scholarship.updatedAt ?? "",
    })) ?? [],
  };

  return formattedData;
};

  */








// ===========================================================================================










// testing pourpose 1 /////
/* 
exports.getAllStudentDataDatewise = async (req, res) => {
  // try {
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
  // } catch (e) {
  //   console.log(e.message);
  //   res.status(500).json({status:false , message:e.message})
  // }
};

// Helper function to process and format the data
function processData(data) {
  let allDetails = {
    studentId: data._id,
    number: data.number,
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

    if (data.StudentId.PreferencesId) {
      let preference = data.StudentId.PreferencesId;
      allDetails.PreferenceDetails = {
        PreferencesId: preference._id,
        higestQualification: preference.highestQuali,
        educationLevel: preference.eduLevel,
        degree: preference.degree,
        areaOfInterest: preference.courses,
        country: preference.country,
        englishTest: preference.testEnglish,
      };

      if (preference.marksPercent) {
        allDetails.PreferenceDetails.markPercentage = preference.marksPercent;
      } else {
        allDetails.PreferenceDetails.GPA = preference.GPA;
      }

      let score = preference.testScore;

      if (score && score.length > 0) {
        allDetails.PreferenceDetails.englishTestScore = {
          writing: score[0].writing || null,
          listening: score[0].listening || null,
          reading: score[0].reading || null,
          speaking: score[0].speaking || null,
          overAll: score[0].overAll || null,
        };
      }
    }

    if (
      data.StudentId.PreferencesId &&
      data.StudentId.PreferencesId.ScholarShips
    ) {
      let appliedScholarships = data.StudentId.PreferencesId.ScholarShips;

      allDetails.appliedScholarship = appliedScholarships.map(
        (scholarship) => ({
          scholarShipId: scholarship.ScholarShipDetails._id,
          title: scholarship.ScholarShipDetails.Title,
          description: scholarship.ScholarShipDetails.Description,
          amount: scholarship.ScholarShipDetails.Amount,
          location: scholarship.ScholarShipDetails.Location,
          status: scholarship.Status,
          noOfSeats: scholarship.ScholarShipDetails.scholarShipCode.noOfSeats,
          scholarShipCode: scholarship.ScholarShipDetails.scholarShipCode,
        })
      );
    }
  }

  return allDetails;
}
 */






//Testing pourpose 2 /////

/* 
exports.getAllStudentDataDatewise = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    console.log(req.body);
    // if date is missing
    if (!fromDate || !toDate) {
      const data = await User.find()
        .populate({
          path: "StudentId",
          model: "StudentDetails",
          select: "fname lname email gender isVerified refferalCode",
        })
        .select("number StudentId")
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
        select: "fname lname email gender isVerified refferalCode",
      })
      .select("number StudentId")
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
  let allDetails = {
    number: data.number,
    studentDetailsId: data.StudentId ? data.StudentId._id : null,
    name: data.StudentId
      ? `${data.StudentId.fname} ${data.StudentId.lname}`
      : null,
    email: data.StudentId ? data.StudentId.email : null,
    gender: data.StudentId ? data.StudentId.gender : null,
    verified: data.StudentId ? data.StudentId.isVerified : null,
    referralCode: data.StudentId ? data.StudentId.refferalCode : null,
  };

  return allDetails;
}

 */















///////////// total of everything   /////////////

exports.allTotalCount = async (req, res) => {
  try {
    let totalStudent = await User.find();
    let totalSc = await Scholarship.find();
    let totalCourses = await coursesModel.find();
    let totalCountry = await countryModel.find();

    let obj = {
      totalStudent: totalStudent.length,
      totalScholarShip: totalSc.length,
      totalCourses: totalCourses.length,
      totalCountry: totalCountry.length,
    };

    res.status(200).json({ status: true, message: "all count", data: obj });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
