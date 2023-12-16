const express = require("express");
const { signUp, verifyOtp } = require("../controller/userController");
const {
  studentDetails,
  getSingleStudentData,
  updteDetails,
  checkDetails,
} = require("../controller/studentDetailsContro");
const { authentication } = require("../middi/auth");
const { shareRef, countOfMyreferal } = require("../controller/referralController");
const { getAllBlogs, getSingleBlog } = require("../controller/blogCtrl");
const { getAllCountry, getAllcourse } = require("../controller/adminPrefrence");


const router = express.Router();

////////////////////////////////////////////////***STUDENT***//////////////////////////////////////////////////////////////////////

//====================== number =========================================
router.route("/signup").post(signUp);
//================== for verification of otp ===========================
router.route("/verify").post(verifyOtp);
//============ create details ==========================================
router.route("/details").post(authentication, studentDetails);
//======= check already filled details or not ===========
router.route("/checkDetails").get(authentication, checkDetails)
//============ profile detail ==========================================
router.route("/profile").get(authentication, getSingleStudentData);
//======================= update profile details  ======================
router.route("/profile/update").put(authentication, updteDetails);



// refferal =====
router.route("/refferal").get(authentication, shareRef )
router.route("/countRef").get(authentication,countOfMyreferal )

////// blog for user ///////

router.route("/getAllBlogStu").get(getAllBlogs)
router.route("/getSingleBlogStu/:id").get(getSingleBlog)

//=========== get all country ===================
router.route("/allcountry").get(authentication, getAllCountry);

//=========== get all courses ===================
router.route("/allCourses").get(authentication, getAllcourse);

module.exports = router;
 