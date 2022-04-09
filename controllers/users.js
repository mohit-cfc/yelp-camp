const User = require("../models/user");

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.login = (req, res, next) => {
  try {
    req.flash("success", "Welcome Back");
    const redirectRoute = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectRoute);
    console.log(req.session);
  } catch (e) {
    next(e);
  }
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next();
      }
      req.flash("success", "Welcome to YelpCamp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.logout = (req, res, next) => {
  req.logOut();
  try {
    console.log(req.user);
    req.flash("success", "Successfully Logged Out");
    res.redirect("/campgrounds");
  } catch (e) {
    next();
  }
};
