const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const preferenceSchema = new mongoose.Schema(
  {
    highestQuali: {
      type: String,
      enum: [
        "12TH",
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ],
      required: true,
    },

    eduLevel: {
      type: String,
      required: true,
    },
    marksPercent: {
      type: String,
    },
    GPA: {
      type: String,
    },
    degree: {
      type: String,

      enum: [
        "UNDERGRADUATE",
        "GRADUATE",
        "POST GRADUATE CERTIFICATE/DIPLOMA",
        "MASTERS DEGREE",
      ],

      required: true,
    },

    courses: {
      type: String,
      // enum: [
      //   "Engineering",
      //   "MBA/BBA",
      //   "Medicine",
      //   "MBBS",
      //   "Journalism",
      //   "HM",
      //   "Aviation",
      //   "Agricultur",
      //   "Pharmacy",
      // ],
      required: true,
    },
    
    country: {
      type: String,
      //  enum: ["INDIA", "CANADA", "AUSTRALIA", "GERMANY", "UK", "USA"],
      required: true,
    },

    testEnglish: {
      type: String,
      enum: ["IELTS", "TOEFL", "PTE"],
      required: true,
    },
    testScore: [
      {
        reading: {
          type: Number,
        },
        writing: {
          type: Number,
        },
        listening: {
          type: Number,
        },
        speaking: {
          type: Number,
        },
        overAll: {
          type: Number,
        },
        englishTestOption: {
          type: String,
          enum: ["Yes", "No"],
          default: "Yes",
        },
      },
    ],

    StudentId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    ScholarShips: [
      {
        type: ObjectId,
        ref: "AppliedScholarShip",
      },
    ],
  },
  { timestamps: true }
);

const preferences = mongoose.model("Preference", preferenceSchema);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ==============  country (admin)=====================
const countrySchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  countryIcon:{
    public_Id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
},


},{timestamps: true});

const countryModel = mongoose.model("country", countrySchema);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ========== Area of intrest for admin =======

const courseSchema = new mongoose.Schema({
  courses: {
    type: String,
    required: true,
  },
  courseIcon:{
    public_Id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
},

},{timestamps: true});
const coursesModel = mongoose.model("AreaOfIntrest", courseSchema);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  preferences,
  countryModel,
  coursesModel,
};
