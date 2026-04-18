const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uplodr";

if (!process.env.MONGO_URI) {
  console.warn("⚠️ MONGO_URI not defined. Falling back to local MongoDB at mongodb://127.0.0.1:27017/uplodr");
}

// fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true }); // Disabled for S3

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ✅ MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ Routes
const authRoutes = require("./routes/user.route");
const fileRoutes = require("./routes/file.route");

// 🔥 IMPORTANT: match frontend URLs
app.use("/api/auth", authRoutes);
app.use("/api/media", fileRoutes); // renamed to match frontend service path /media

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy ✅" });
});

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "Backend is live ✅" });
});

// ✅ API fallback for not-found endpoints (helps avoid HTML 404 responses)
app.use("/api", (req, res) => {
  if (!res.headersSent) {
    res.status(404).json({
      message: `API endpoint not found: ${req.originalUrl}`,
    });
  }
});

// ✅ Production (optional)
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../build");
  app.use(express.static(buildPath));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.url.startsWith("/api")) {
      res.sendFile(path.resolve(buildPath, "index.html"));
    } else {
      next();
    }
  });
}

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Internal error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});