import crypto from "crypto";

// Generate random token
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash token
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
