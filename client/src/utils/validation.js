export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordStrengthMessage = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[A-Z])/.test(password))
    return "Include at least one uppercase letter";
  if (!/(?=.*[a-z])/.test(password))
    return "Include at least one lowercase letter";
  if (!/(?=.*\d)/.test(password)) return "Include at least one number";
  if (!/(?=.*[@$!%*?&])/.test(password))
    return "Include at least one special character";
  return "";
};

export const validateRecaptcha = (captchaValue) => {
  if (!captchaValue) {
    return "Please complete the reCAPTCHA verification";
  }
  return null;
};
