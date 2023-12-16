const express = require("express");
const {
  addCountry,
  getAllCountry,
  removeCountry,
  addcourses,
  getAllcourse,
  removeCourse,
  logInAdmin,
  studentExcel,
  getAllData,
  getAllStudentDataDatewise,
  allTotalCount,
} = require("../controller/adminPrefrence");
const {
  Scholarships,
  updateScholarship,
  getSingleScholarship,
  getAllScholarships,
  deleteScholarship,
  getAllAdminScholarships,
} = require("../controller/scholarShipController");
const {
  getSingleStudentDataAdmin,
  getAllStudentData,
  updteDetailsAdmin,
  deleteDetailsAdmin,
} = require("../controller/studentDetailsContro");
const {
  getPrefrencsDataAdmin,
  updateStudentPrefAdmin,
  getAllPreferencesAdmin,
  deletePrefAdmin,
  scStatusUpdate,
  getAllAppliedSc,
} = require("../controller/preferenceController");
const { authentication, authorization } = require("../middi/auth");
const { createBlog, updateBlog, getSingleBlog, deleteBlog, getAllBlogs } = require("../controller/blogCtrl");

const router = express.Router();

//================= admin logIn ===================================

router.route("/logIn").post(logInAdmin);

/////////////////////////////////////////////////// [country by Admin]  /////////////////////////////////////////////////////////////.

// ========== country added =====================
router.route("/country/add").post(authentication, authorization, addCountry);
//=========== get all country ===================
router.route("/allcountry").get(authentication, authorization, getAllCountry);
//============ remove country ===================
router
  .route("/country/delete")
  .delete(authentication, authorization, removeCountry);

//////////////////////////////////////////////////   [courses by Admin]  /////////////////////////////////////////////////////////////////////////////

// ========== courses added ===================

router.route("/course/add").post(authentication, authorization, addcourses);
//=========== get all course ===================
router.route("/allCourses").get(authentication, authorization, getAllcourse);
//============ remove course ===================
router
  .route("/course/delete")
  .delete(authentication, authorization, removeCourse);

///////////////////////////// ScholarShip  //////////////////////////////////////////////////////////////////////
// ==================== Add ScholarShip ===============
router
  .route("/scholarship/add")
  .post(authentication, authorization, Scholarships);
// =============  update ScholarShip ====================
router
  .route("/scholarship/update/:Id")
  .put(authentication, authorization, updateScholarship);
// =============  get Single ScholarShip =================
router
  .route("/scholarship/:Id")
  .get(authentication, authorization, getSingleScholarship);
//================== get All ScholarShip ==================
router
  .route("/allScholarship")
  .get(authentication, authorization, getAllAdminScholarships);

//================== delete ScholarShip ==================
router
  .route("/scholarship/delete/:Id")
  .delete(authentication, authorization, deleteScholarship);

//////////////////////////////////////////////// ***ADMIN*** Student details //////////////////////////////////////////////////////////////////////

//================= get single data of student by admin =======

router
  .route("/student/:id")
  .get(authentication, authorization, getSingleStudentDataAdmin);

//=========get all user admin =========
router
  .route("/allStudent")
  .post(authentication, authorization, getAllStudentData);

//================== update student profile by admin ========
router
  .route("/stuProfile/update/:id")
  .put(authentication, authorization, updteDetailsAdmin);
//=========== delete Sttudent detail by admin =========

router
  .route("/stuProfile/delete/:id")
  .delete(authentication, authorization, deleteDetailsAdmin);

/////////////////////////////////////////////////////// ***ADMIN*** Student preferences  /////////////////////////////////////////////////////////////////////////////

// ============== get preference details with stiudent details ===================

router
  .route("/student/pref/:Id")
  .get(authentication, authorization, getPrefrencsDataAdmin);

// ============= update  preference of Any Student ===============================
router
  .route("/student/updatePref/:prefId")
  .put(authentication, authorization, updateStudentPrefAdmin);

// ============= get  preference of All Student ==================================
router
  .route("/studentAllPref")
  .get(authentication, authorization, getAllPreferencesAdmin);

// =============== delete any particular preferences =============================
router
  .route("/student/pref/delete/:id")
  .delete(authentication, authorization, deletePrefAdmin);

// =============== update Applied ScholarSchip Status of any prticular Student =========


// ======= get All sc of a prticular student ====

router
  .route("/student/scholarship/:stuId")
  .get(authentication, authorization, getAllAppliedSc);

router
  .route("/student/scholarship/status/:stuId/:scId")
  .put(authentication, authorization, scStatusUpdate);

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// excel route

router.route("/stuDataExcel").get(studentExcel);

router.route("/allData").post(getAllData);

router.route("/getallData").post(authentication, authorization, getAllStudentDataDatewise)


//////////////////// Blog //////////////////// 


router.route("/createBlog").post(authentication, authorization, createBlog)
router.route("/updateBlog/:id").put(authentication, authorization, updateBlog)
router.route("/getSingleBlog/:id").get(authentication, authorization, getSingleBlog)
router.route("/deleteSingleBlog/:id").delete(authentication, authorization, deleteBlog)
router.route("/getAllBlog").get(authentication, authorization, getAllBlogs)


/////////// all count //////


router.route("/totalCount").get(authentication, authorization, allTotalCount)





module.exports = router;
