const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
  };


  const validateMobileNo = (Number) => {
    return /^[6789][0-9]{9}$/g.test(Number);
  };


  module.exports = {
    validateEmail,
    validateMobileNo,
  };