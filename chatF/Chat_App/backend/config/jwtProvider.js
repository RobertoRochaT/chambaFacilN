import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
  // Always use 'id' as the field name for consistency
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "48h" });
  return token;
};

const getUserIdFromToken = (token) => {
  const decodedToken = jwt.verify(token, JWT_SECRET);
  return decodedToken.id || decodedToken.userId;
};

export { generateToken, getUserIdFromToken };