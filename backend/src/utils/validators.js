function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function isValidPassword(password) {
    const hasMinimumLength = password.length >= 4;
    const hasUppercaseLetter = /[A-Z]/.test(password);
  
    return hasMinimumLength && hasUppercaseLetter;
  }
  
  module.exports = {
    isValidEmail,
    isValidPassword,
  };