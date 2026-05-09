// Validation functions for authentication

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!exports.validateName(name)) {
    errors.push("Name must be between 2 and 50 characters");
  }

  if (!exports.validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!exports.validatePassword(password)) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors,
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!exports.validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors,
    });
  }

  next();
};
