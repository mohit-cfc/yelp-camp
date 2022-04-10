const Campgrounds = require("../models/campgrounds");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const mongoose = require("mongoose");
const mapBoxToken =
  "pk.eyJ1IjoibW9oaXQtY2ZjIiwiYSI6ImNsMW0weGt2ODBiam8zanBud293N24zdzYifQ.sWzae-tyKGv300WbAT1zsw";
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });
const unsplash = require("unsplash-js");
const { createApi, toJson } = unsplash;
const fetch = require("node-fetch");
require("dotenv").config();

const images = createApi({
  accessKey: "wbYuyxZwk7ZlB6ZOJaEdmfcJ8Zdk2s5L9Lt2Yt9zGM8",
  fetch: fetch,
});

const dbUrl = process.env.DB_URL;
const sample = (array) => array[Math.floor(Math.random() * array.length)];
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Mongo Connection Open");

    const seedDb = async function () {
      // await Campgrounds.deleteMany({});
      for (let i = 0; i < 30; i++) {
        const random1000 = Math.floor(Math.random() * 406);
        const randImg = Math.floor(Math.random() * 30);
        const location = `${cities[random1000].city} , ${cities[random1000].state}`;
        const geoData = await geoCoder
          .forwardGeocode({
            query: location,
            limit: 1,
          })
          .send();
        const price = Math.floor(Math.random() * 10000);

        images.search
          .getPhotos({
            query: "Nature",
            page: 1,
            perPage: 30,
            orientation: "landscape",
          })
          .then(toJson)
          .then(async (data) => {
            //   console.log(img);
            const camp = new Campgrounds({
              author: "6249205c6207a7d66f917429",
              title: `${sample(descriptors)} ${sample(places)}`,
              location: location,
              description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vel iure deserunt nulla cumque officia expedita, saepe distinctio sapiente ut cupiditate, natus tenetur commodi dolores perspiciatis rerum quas minus dolorem.",
              geometry: geoData.body.features[0].geometry,
              images: [
                {
                  url: data.response.results[randImg].urls.small,
                  filename: "someImage",
                },
              ],
              price: price,
            });
            await camp.save();
          })
          .catch((err) => {
            console.log(err);
          });
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
