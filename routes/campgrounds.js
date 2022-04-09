const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campground");
const catchAsync = require("../utils/catchAsync");
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

const {
  isLoggedIn,
  isCorrectUser,
  validateCampground,
} = require("../middleware");
const res = require("express/lib/response");

router.get("/", catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post(
  "/",
  isLoggedIn,
  upload.array("image"),
  validateCampground,
  catchAsync(campgrounds.newCampground)
);

// router.post("/", upload.array("image"), (req, res) => {
//   res.send(req.body, req.files);
// });

router.get(
  "/:id/edit",
  isLoggedIn,
  isCorrectUser,
  catchAsync(campgrounds.renderEditForm)
);

router.get("/:id", catchAsync(campgrounds.showPage));

router.put(
  "/:id",
  isLoggedIn,
  isCorrectUser,
  upload.array("image"),
  validateCampground,
  catchAsync(campgrounds.editCampground)
);

router.delete(
  "/:id",
  isLoggedIn,
  isCorrectUser,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
