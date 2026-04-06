const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || 'uplodr_dev_secret';

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);

      const userId = decoded.id || decoded._id;

      try {
        req.user = await User.findById(userId).select("-password");
        if (!req.user) {
          console.error(`User not found for ID: ${userId}`);
          return res.status(401).json({ message: "User not found" });
        }
      } catch (dbError) {
        console.error("DB error in auth middleware:", dbError.message);
        return res.status(401).json({ message: "Authentication failed - invalid user" });
      }

      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};