// const fast2sms = require("fast-two-sms");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const User = require("../model/userModel");
const Otp = require("../model/otpModel");
const validation = require("../validations/validation");
const twilio = require("twilio");


///////////////////////////////////////// SIGN UP //////////////////////////////////////////////////////////

//========================================== 1 ==============================


exports.signUp = async (req, res) => {

  try {
  const OTP = otpGenerator.generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const number = req.body.number;
  console.log(OTP);

  if (!validation.validateMobileNo(number)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid phone number" });
  }
//======================== twilio (MY AUTH , SID AND VERIFIED PHONE USED) ==============
// const client = twilio(process.env.TWILIO_ACCOUNT_SID,
//    process.env.TWILIO_AUTH_TOKEN);
//     const message = await client.messages.create({
//       body: `Your OTP for registration is ${OTP}`, 
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to:"+91"+ number,
//     });
//     console.log(message);

//==========================================

  const otp = { number: number, otp: OTP };

  const salt = await bcrypt.genSalt(10);

  otp.otp = await bcrypt.hash(otp.otp, salt);

  const result = await Otp.create(otp);

  let user = await User.findOne({ number: req.body.number });

  if (!user) {
    user = await User.create({ number: req.body.number });
  }

  res.status(200).json({message:"Otp json sucessfully!", OTP:OTP});
}catch (error) {
  console.error(error);
  res.status(500).json({ status: false, message: "Failed to json OTP" });
}
};

//////////////////////////////////////// VERIFYING STUDENT BY OTP //////////////////////////////////////

exports.verifyOtp = async (req, res) => {
  try{
  const otpHolder = await Otp.find({ number: req.body.number });
  if (otpHolder.length === 0)
    return res
      .status(400)
      .json({ status: false, message: "You used an expired OTP or the number is invalid!" });

  const rightOtpFind = otpHolder[otpHolder.length - 1];

  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);
  if (rightOtpFind.number === req.body.number && validUser) {
    let user = await User.findOne({ number: req.body.number });

    const token = jwt.sign(
      {
        _id: user._id,
        number: user.number,
      }, 
      process.env.JWT_SECRET_KEY,
    );

    await Otp.deleteMany({ number: req.body.number });

    return res.status(200).json({
      status: true,
      message: "User verified successfully!",
      token: token,
      data: user,
    });
  } else {
    return res
      .status(400)
      .json({ status: false, message: "Your OTP was wrong!" });
}
}catch (error) {
  console.error(error);
  res.status(500).json({ status: false, message: "Failed to json OTP" });
}
};
 















