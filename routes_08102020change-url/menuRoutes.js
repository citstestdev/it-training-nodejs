var express = require("express");
var router = express();
var path = require("path");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var checkLogin = require("../middleware/check");

const {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
} = require("../models/Commonmodel");

var multer = require("multer");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
// var url = "mongodb://localhost:27017/it_training";
var { ObjectID } = require("mongodb");

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

router.get("/menu", checkLogin, (req, res, next) => {
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

    var courseslug = [];
    dbo
      .collection("courses")
      .find({ type: "item" })
      .toArray(function (err, result) {
        courseslug = result;
      });

    var blogslug = [];
    dbo
      .collection("tbblog")
      .find({ type: "item" })
      .toArray(function (err, result) {
        blogslug = result;
      });

    var footerwidget = [];
    dbo
      .collection("menus")
      .find({ menutype: "2" })
      .toArray(function (err, result) {
        footerwidget = result;
      });

    var popularwidget = [];
    dbo
      .collection("menus")
      .find({ menutype: "3" })
      .toArray(function (err, result) {
        popularwidget = result;
      });

    dbo
      .collection("menus")
      .find({ menutype: "1" })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("common/menuform.html", {
          title: "menu",
          opt: option,
          pagedata: result,
          users: userlogin,
          courses: courseslug,
          blog: blogslug,
          footerwidget: footerwidget,
          popularwidget: popularwidget,
          logedin: session.email,
          message: req.flash("message"),
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});
// { upsert: true }
router.post("/menu", async (req, res, next) => {
  var menusdata = require("../models/Menumodel");
  var insertitemdata = {
    title: req.body.title,
    slugname: req.body.slugname.trim(),
    menuurl: req.body.menuurl.trim(),
    description: req.body.description.trim(),
    indexnumber: req.body.indexnumber.trim(),
    menutype: req.body.menutype.trim(),
    createAt: new Date(),
  };

  const newMenu = new menusdata(insertitemdata);
  newMenu.save((saveErr) => {
    if (saveErr) {
      // console.log("eror");
      req.flash("message", "Index number already exist!");
      return res.redirect("/menu");
    } else {
      // console.log("hello");
      session.message = "";
      req.flash("message", "Menu added successfully");
      return res.redirect("/menu");
    }
  });
});

router.get("/menuremove/:id", async function (req, res, next) {
  deletebyid("menus", req.params.id);
  session.message = "";
  req.flash("message", "Menu deleted successfully");
  res.redirect("/menu");
});

router.get("/getmenu", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("menus")
      .find({ menutype: "1" })
      .sort({ indexnumber: 1 })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getfooterwidget", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("menus")
      .find({ menutype: "2" })
      .sort()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getpopularwidget", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("menus")
      .find({ menutype: "3" })
      .sort()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
