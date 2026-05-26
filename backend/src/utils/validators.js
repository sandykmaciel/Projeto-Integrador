function isValidEmail(email) {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function isValidPassword(password) {
  if (!password) {
    return false;
  }

  const hasMinimumLength = password.length >= 4;
  const hasUppercaseLetter = /[A-Z]/.test(password);

  return hasMinimumLength && hasUppercaseLetter;
}

module.exports = {
  isValidEmail,
  isValidPassword,
};