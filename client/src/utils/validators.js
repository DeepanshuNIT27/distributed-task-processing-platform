export const validateLogin = (email, password) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) errors.email = "Email is required";
  else if (!emailRegex.test(email)) errors.email = "Invalid email format";

  if (!password) errors.password = "Password is required";
  return errors;
};

export const validateSignup = (name, email, password, confirmPassword) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 3)
    errors.name = "Name must be at least 3 characters";

  if (!email) errors.email = "Email is required";
  else if (!emailRegex.test(email)) errors.email = "Invalid email format";

  if (!password || password.length < 6)
    errors.password = "Password must be at least 6 characters";

  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
};
