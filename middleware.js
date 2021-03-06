const Campgound = require("./models/campgrounds");
const Review = require("./models/reviews");
const { campgroundSchema, reviewSchema } = require("./Schemas");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    console.log(req.session);
    req.flash("error", "You Must be Signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.isCorrectUser = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campgound.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You can't modify someone else's campground");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You can't do this");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
