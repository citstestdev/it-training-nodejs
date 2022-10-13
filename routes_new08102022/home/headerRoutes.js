var express = require("express");
var router = express();
var path = require("path");
const session = require("express-session");
var multer = require("multer");
var checkLogin = require("../../middleware/check");

const { insertdata } = require("../../models/Commonmodel");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/it_training";
const { ObjectID } = require("mongodb");

var imagec = "";

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

router.get("/header", checkLogin, function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

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

    dbo.collection("homeheader").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("home/headerform.html", {
        title: "header",
        opt: option,
        pagedata: result,
        users: userlogin,
        logedin: session.email,
        message: req.flash("message"),
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post("/insertfun", (req, res, next) => {
  var myobj = {
    oid: "1",
    pagetitle: req.body.pagetitle.trim(),
    heading: req.body.heading.trim(),
  };

  let showm = "";

  insertdata("homeheader", myobj, showm);
  // session.message = "Header updated successfully";
  req.flash("message", "Header updated successfully");
  return res.redirect("/header");
});

// api call for all data home header  ===============================

router.get("/getheader", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("homeheader").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/homemetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "home" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
