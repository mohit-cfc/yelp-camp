const Campgrounds = require("../models/campgrounds");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const mongoose = require("mongoose");
const mapBoxToken =
  "pk.eyJ1IjoibW9oaXQtY2ZjIiwiYSI6ImNsMW0weGt2ODBiam8zanBud293N24zdzYifQ.sWzae-tyKGv300WbAT1zsw";
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

const sample = (array) => array[Math.floor(Math.random() * array.length)];
mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo Connection Open");

    const seedDb = async function () {
      await Campgrounds.deleteMany({});
      for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 406);
        const location = `${cities[random1000].city} , ${cities[random1000].state}`;
        const geoData = await geoCoder
          .forwardGeocode({
            query: location,
            limit: 1,
          })
          .send();
        const price = Math.floor(Math.random() * 10000);

        const camp = new Campgrounds({
          author: "6249205c6207a7d66f917429",
          title: `${sample(descriptors)} ${sample(places)}`,
          location: location,
          description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vel iure deserunt nulla cumque officia expedita, saepe distinctio sapiente ut cupiditate, natus tenetur commodi dolores perspiciatis rerum quas minus dolorem.",
          geometry: geoData.body.features[0].geometry,
          images: [
            {
              url: "https://source.unsplash.com/collection/483251",
              filename: "someImage",
            },
          ],
          price: price,
        });
        await camp.save();
      }
      console.log("Done");
    };
    seedDb().then(() => {
      mongoose.connection.close();
    });
  })
  .catch((err) => {
    console.log("Error");
    console.log(err);
  });
