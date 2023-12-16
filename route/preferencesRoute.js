const express = require("express");
const { authentication } = require("../middi/auth");
const {
  studentPref,
  getPrefrencsData,
  updateStudentPref,
  recomandation,
  applyNow,
  getAllApliedScholarShip,
  checkstudentPref,
} = require("../controller/preferenceController");

const router = express.Router();

///////////////////////////////////////////////// *** Student Preferences ***  ///////////////////////////////////////////////////////////////////////////////////


router.route("/preferences").post(authentication, studentPref);

// ===check alredy filled or not ======
router.route("/checkPref").get(authentication,checkstudentPref)

router.route("/myPreferences").get(authentication, getPrefrencsData);

router.route("/preferences/update").put(authentication, updateStudentPref);

///////////////////////// [ recomdation] //////////////////////////

// ============================ get recomandation ======================

router.route("/scholarships").get(authentication, recomandation);
//================= Student can apply recomanded ScholarShip ============== 
router.route("/applyNow/:id").post(authentication, applyNow);
//=================== get All Applied ScholarShip ==========================
router.route("/apliedScholarShips").get(authentication, getAllApliedScholarShip);

module.exports = router;
