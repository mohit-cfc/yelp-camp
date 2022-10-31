const {cloudinary} = require("../cloudinary");
const Campgound = require("../models/campgrounds");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
  const campgrounds = await Campgound.find({});
  res.render("campgrounds/index", {campgrounds});
};

module.exports.newIndex = async (req, res) => {
  const campgrounds = await Campgound.find({});
  res.render("campgrounds/newIndex", {campgrounds});
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.newCampground = async (req, res) => {
  const geoData = await geoCoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campgound(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  campground.geometry = geoData.body.features[0].geometry;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully Created a New Campground!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campgound.findById(id);
  res.render("campgrounds/edit", {campground});
};

module.exports.showPage = async (req, res) => {
  const {id} = req.params;
  const campground = await Campgound.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // console.log(campground.author.username);
  if (!campground) {
    req.flash("error", "Campgound Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", {campground});
};

module.exports.editCampground = async (req, res) => {
  const {id} = req.params;
  console.log(req.body);
  const campground = await Campgound.findByIdAndUpdate(id, req.body.campground);
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  campground.save();
  if (req.body.deleteImages) {
    for (filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: {images: {filename: {$in: req.body.deleteImages}}},
    });
    console.log(campground);
  }

  req.flash("success", `Successfully Updated ${campground.title}`);
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campgound.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campground!");
  res.redirect("/campgrounds");
};

module.exports.searchCampground = async (req, res) => {
  const campgrounds = await Campgound.find({title: req.query.title});
  res.render("campgrounds/results", {campgrounds});

  // res.render("campgrounds/results");
};
