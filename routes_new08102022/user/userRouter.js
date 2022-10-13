var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");
var sharp = require("sharp");

var checkLogin = require("../../middleware/check");
const {
  insertdata,
  insertnewdata,
  deletebyid,
} = require("../../models/Commonmodel");

router.use("/uploads", express.static(__dirname + "/uploads"));
router.use("/uploadimg", express.static(__dirname + "/uploadimg"));
router.use(
  "/uploadimg/400x250",
  express.static(__dirname + "/uploadimg/400x250")
);
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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = require("path");
    imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "uploadimg");
  },
  filename: function (req, file, cb) {
    cb(null, imagec);
    setTimeout(function () {
      sharp("./uploadimg/" + imagec)
        .resize(400, 250)
        .toFile("./uploadimg/400x250" + "/middile_" + imagec);
    }, 1500);
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

// add mian category

router.get("/users", function (req, res, next) {
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

    var allcategory = [];
    dbo
      .collection("categories")
      .find({ parent_id: "0" })
      .toArray(function (err, result2) {
        allcategory = result2;
      });

    var reviews = [];
    dbo
      .collection("tbblog")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        reviews = result2;
      });

    dbo
      .collection("users")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("common/userall.html", {
          title: "Uesr",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          allcategory: allcategory,
          logedin: session.email,
          msg: session.massage,
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

router.get("/user", function (req, res, next) {
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

    var allcategory = [];
    dbo
      .collection("categories")
      .find({ parent_id: "0" })
      .toArray(function (err, result2) {
        allcategory = result2;
      });

    var reviews = [];
    dbo
      .collection("tbblog")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        reviews = result2;
      });

    dbo.collection("tbblog").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("common/register_ins.html", {
        title: "Uesr",
        opt: option,
        pagedata: result,
        users: userlogin,
        tablecontent: reviews,
        allcategory: allcategory,
        logedin: session.email,
        msg: session.massage,
      });

      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.get("/allusers", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("users")
      .find({ role: 2 })
      .limit(Number(4))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getusers", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("users")
      .find()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
