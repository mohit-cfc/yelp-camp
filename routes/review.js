const express = require("express");
const router = express.Router({ mergeParams: true }); //merge params used for :id from /campgrounds/:id/reviews used in index.js

const Campground = require("../models/campgrounds");
const Review = require("../models/reviews");
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post("/", validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
