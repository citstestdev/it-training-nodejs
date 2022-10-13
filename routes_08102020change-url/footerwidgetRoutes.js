var express = require("express");
var router = express();
var path = require("path");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");

const {
  insertdata,
  insertnewdata,
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

router.get("/footerwidget", (req, res, next) => {
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

    dbo
      .collection("menus")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("common/footerwidget.html", {
          title: "menu",
          opt: option,
          pagedata: result,
          userlogin: userlogin,
          msg: session.massage,
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});
// { upsert: true }
router.post("/footerwidget", async (req, res, next) => {
  var menusdata = require("../models/Menumodel");
  var insertitemdata = {
    title: req.body.title,
    slugname: req.body.slugname.trim(),
    menuurl: req.body.menuurl.trim(),
    description: req.body.description.trim(),
    indexnumber: req.body.indexnumber.trim(),
    createAt: new Date(),
  };

  const newMenu = new menusdata(insertitemdata);
  newMenu.save((saveErr) => {
    if (saveErr) {
      return res.status(412).send({
        success: false,
        message: saveErr,
      });
    } else {
      session.message = "Menu added successfully";
      return res.redirect("/footerwidget");
    }
  });
});

router.get("/menuremove/:id", async function (req, res, next) {
  deletebyid("menus", req.params.id);
  session.message = "Menu deleted successfully";
  res.redirect("/menu");
});

router.get("/getmenu", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("menus")
      .find()
      .sort({ indexnumber: 1 })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
