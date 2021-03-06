const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const passport = require("passport");
const users = require("../controllers/users");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

router.get("/login", users.renderLogin);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

router.get("/register", users.renderRegister);

router.post("/register", catchAsync(users.register));

router.get("/logout", users.logout);

module.exports = router;
