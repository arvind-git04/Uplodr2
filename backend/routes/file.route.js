const express = require("express");
const router = express.Router();

const upload = require("../utils/s3.config");
const {
  uploadMedia,
  deleteMedia,
  listMedia,
} = require("../controllers/media.controller");

const { protect } = require("../middleware/auth.middleware");

router.use((req, res, next) => {
  console.log(`[file.route] ${req.method} ${req.originalUrl} => ${req.baseUrl}${req.path}`);
  next();
});

// ✅ FIXED
router.post("/upload", protect, upload.single("media"), uploadMedia);
router.get("/", protect, listMedia);
router.delete("/:id", protect, deleteMedia);

module.exports = router;