// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }
require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/review");
const usersRoutes = require("./routes/users");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

const secret = process.env.SECRET || "secret";
const dbUrl = process.env.DB_URL;
const mongoose = require("mongoose");
const catchAsync = require("./utils/catchAsync");
// mongodb://localhost:27017/yelp-camp
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo Connection Open");
  })
  .catch((err) => {
    console.log("Error");
    console.log(err);
  });

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("Error", e);
});

const sessionConfig = {
  store: store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //time equivalent to a week
    age: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(flash());

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

//Passport stuff

app.use(passport.initialize());
app.use(passport.session()); //put after using session
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware, adding success and failure to the res.locals object
app.use((req, res, next) => {
  res.locals.currentUser = req.user; //for hiding log out when user is not signed in & hiding log in and register when user is signed in
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// using our campground and reviews routers
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", usersRoutes);

app.get(
  "/about",
  catchAsync((req, res) => {
    res.render("campgrounds/about");
  })
);

app.get("/", (req, res) => {
  res.render("home");
});

// app.get("/fakeuser", async (req, res) => {
//   const user = new User({ email: "bob1@gmail.com", username: "bob1" });
//   const newUser = await User.register(user, "password");
//   res.send(newUser);
//   console.log(User, user, newUser);
// });

app.all("*", (req, res, next) => {
  next(new ExpressError("Not Found", 404));
});

app.use((err, req, res, next) => {
  const {status = 500} = err;
  if (!err.message) {
    err.message = "Something Went Wrong";
  }
  res.status(status).render("error", {err});
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
