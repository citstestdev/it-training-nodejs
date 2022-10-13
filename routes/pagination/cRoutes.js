var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");

var checkLogin = require("../../middleware/check");
var passModel = require("../../models/add_password");
const {
  insertdata,
  insertnewdata,
  deletebyid,
} = require("../../models/Commonmodel");

router.use("/uploads", express.static(__dirname + "/uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = require("path");
    imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, imagec);
  },
});

var upload = multer({ storage: storage });

try {
  mongoose.connect(
    process.env.MONGODB_URI || `mongodb://localhost:27017/it_training`
  );
  var MongoClient = require("mongodb").MongoClient;
  var url = "mongodb://localhost:27017/it_training";
  var { ObjectID } = require("mongodb");

  console.log("connected to database.");
} catch (error) {
  console.log("could not connect to database", error);
}

// pagination with server site

router.get("/view-all", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var perPage = 1;
    var page = req.params.page || 1;
    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin = result;
      });

    var option = [];
    dbo.collection("tb_option").findOne(function (err, result) {
      option = result;
    });

    var allcategory = [];
    dbo
      .collection("categories")
      .find({ parent_id: "0" })
      .toArray(function (err, result) {
        allcategory = result;
      });

    var reviews = [];
    dbo.collection("courses").findOne({ oid: "1" }, function (err, result) {
      reviews = result;
    });

    dbo
      .collection("courses")
      .find({ type: "item" })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .toArray(function (err, data) {
        if (err) throw err;
        dbo
          .collection("courses")
          .find({ type: "item" })
          .toArray(function (err, result2) {
            res.render("course/coursepaginationfrom.html", {
              title: "course",
              opt: option,
              records: data,
              pagedata: reviews,
              userlogin: userlogin,
              current: page,
              tablecontent: data,
              allcategory: allcategory,
              pages: Math.ceil(result2.length / perPage),
              msg: "",
            });
          });
      });
  });
});

router.get("/view-all/page", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var perPage = 1;
    var page = req.params.page || 1;
    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin = result;
      });

    var option = [];
    dbo.collection("tb_option").findOne(function (err, result) {
      option = result;
    });

    var allcategory = [];
    dbo
      .collection("categories")
      .find({ parent_id: "0" })
      .toArray(function (err, result) {
        allcategory = result;
      });

    var reviews = [];
    dbo.collection("courses").findOne({ oid: "1" }, function (err, result) {
      reviews = result;
    });

    dbo
      .collection("courses")
      .find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .toArray(function (err, data) {
        if (err) throw err;
        dbo
          .collection("courses")
          .find({ type: "item" })
          .toArray(function (err, result2) {
            res.render("course/coursepaginationfrom.html", {
              title: "course",
              opt: option,
              records: data,
              userlogin: userlogin,
              pagedata: reviews,
              current: page,
              tablecontent: data,
              allcategory: allcategory,
              pages: Math.ceil(result2.length / perPage),
              msg: "",
            });
          });
      });
  });
});

module.exports = router;
