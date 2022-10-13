var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var passModel = require("../models/add_password");

try {
  mongoose.connect(
    process.env.MONGODB_URI ||
      `mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority`
  );
  var MongoClient = require("mongodb").MongoClient;
  // var url = "mongodb://localhost:27017/it_training";
  var url =
    "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
  // var { ObjectID } = require("mongodb");

  console.log("connected to database.");
} catch (error) {
  console.log("could not connect to database", error);
}

router.get("/add-new-password", function (req, res, next) {
  res.render("add-new-password.html");
});

router.post("/add-new-password", function (req, res, next) {
  var pass_cat = req.body.pass_cat;
  var project_name = req.body.project_name;
  var pass_details = req.body.pass_details;

  var password_details = new passModel({
    password_category: pass_cat,
    project_name: project_name,
    password_detail: pass_details,
  });

  password_details.save(function (err, doc) {
    res.render("add-new-password.html", {
      success: "Password Details Inserted Successfully",
    });
  });
});

router.get("/view-all-password/", function (req, res, next) {
  var perPage = 1;
  var page = req.params.page || 1;

  passModel
    .find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      if (err) throw err;
      passModel.countDocuments({}).exec((err, count) => {
        res.render("view-all-password.html", {
          records: data,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

router.get("/view-all-password/:page", function (req, res, next) {
  var perPage = 1;
  var page = req.params.page || 1;

  passModel
    .find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, data) {
      if (err) throw err;
      passModel.countDocuments({}).exec((err, count) => {
        res.render("view-all-password.html", {
          records: data,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

module.exports = router;
