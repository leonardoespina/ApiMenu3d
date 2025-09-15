const validator = require("validator");

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return validator.escape(input.trim());
  }
  return input; // <-- importante: si no es string, devuélvelo como está
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    sanitized[key] = sanitizeInput(obj[key]);
  }
  return sanitized;
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
};
