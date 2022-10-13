var express = require("express");
var router = express();
var path = require("path");
var multer = require("multer");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var checkLogin = require("../middleware/check");
var sharp = require("sharp");

const {
  insertdata,
  insertnewdata,
  deletebyid,
} = require("../models/Commonmodel");

var MongoClient = require("mongodb").MongoClient;
var { ObjectID } = require("mongodb");
var url = "mongodb://localhost:27017/it_training";

var imagec = "";

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
        .resize(250, 250)
        .toFile("./uploadimg/400x250" + "/middile_" + imagec);
    }, 1500);
  },
});

var upload = multer({ storage: storage });

router.get(
  "/setting",
  checkLogin,
  upload.single("userPhoto"),
  (req, res, next) => {
    console.log(session.message);

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("it_training");

      var userlogin = [];
      dbo
        .collection("users")
        .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
          userlogin = result;
        });

      dbo.collection("tb_option").findOne(function (err, result) {
        if (err) {
          return;
        }
        if (!result) {
          res.render("common/setting_form.html", {
            title: "setting",
            users: [],
            logedin: "",
            opt: [],
            message: req.flash("message"),
          });
          console.log(err);
        } else {
          res.render("common/setting_form.html", {
            title: "setting",
            users: userlogin,
            logedin: session.email,
            opt: result,
            message: req.flash("message"),
          });
        }
      });
    });
    // }, 1500);
  }
);

router.post("/setting", upload.single("userPhoto"), async (req, res, next) => {
  const file = req.file;
  var imagepath = "";
  if (req.body.oldimage != "") {
    imagepath = req.body.oldimage;
  }

  if (file && !file.length) {
    // Do something
    imagepath = file.filename;
  }

  var myobj = {
    sitename: req.body.sitename.trim(),
    description: req.body.description.trim(),
    header_analytics: req.body.header_analytics.trim(),
    footer_analytics: req.body.footer_analytics.trim(),
    image: imagepath,
    imagemiddile: "middile_" + imagepath,
  };

  let showm = "";
  insertdata("tb_option", myobj, showm);

  // return res.redirect("/setting");
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin = result;
      });

    dbo.collection("tb_option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        res.render("common/setting_form.html", {
          title: "setting",
          users: [],
          logedin: "",
          opt: [],
          message: req.flash("message"),
        });
        console.log(err);
      } else {
        res.render("common/setting_form.html", {
          title: "setting",
          users: userlogin,
          logedin: session.email,
          opt: result,
          message: req.flash("message"),
        });
      }
    });
  });
  req.flash("message", "Setting updated successfully");
  return res.redirect("/setting");
});

router.post("/header", (req, res, next) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    var myobj = {
      oid: "1",
      clientemail: req.body.clientemail.trim(),
      phone: req.body.phone.trim(),
    };

    dbo
      .collection("tb_option")
      .findOneAndUpdate(
        { oid: "1" },
        { $set: myobj },
        { upsert: true, returnNewDocument: true },
        function (err, res) {}
      );
    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin = result;
      });

    dbo.collection("tb_option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        // req.flash("message", "");
        res.render("common/setting_form.html", {
          title: "setting",
          users: [],
          logedin: "",
          opt: [],
          message: req.flash("message"),
        });
        console.log(err);
      } else {
        res.render("common/setting_form.html", {
          title: "setting",
          users: userlogin,
          logedin: session.email,
          opt: result,
          message: req.flash("message"),
        });
      }
    });
  });
  req.flash("message", "Header updated successfully");
  return res.redirect("/setting");
});

router.post("/footer", (req, res, next) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    var myobj = {
      oid: "1",
      alternateemail: req.body.alternateemail.trim(),
      alternatephone: req.body.alternatephone.trim(),
      query: req.body.query.trim(),
      button: req.body.button.trim(),
      address: req.body.address.trim(),
      address_1: req.body.address_1.trim(),
      address_2: req.body.address_2.trim(),
      footer: req.body.footer.trim(),
    };

    dbo
      .collection("tb_option")
      .findOneAndUpdate(
        { oid: "1" },
        { $set: myobj },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          // console.log("footer document inserted");
          // session.massage = "Footer updated successfully";
        }
      );

    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin = result;
      });

    dbo.collection("tb_option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        // console.log("hfdbsh");
        // req.flash("message", "");
        res.render("common/setting_form.html", {
          title: "setting",
          users: [],
          logedin: "",
          opt: [],
          message: req.flash("message"),
        });
        console.log(err);
      } else {
        res.render("common/setting_form.html", {
          title: "setting",
          users: userlogin,
          logedin: session.email,
          opt: result,
          message: req.flash("message"),
        });
      }
    });
  });
  req.flash("message", "Footer updated successfully");
  return res.redirect("/setting");
});

module.exports = router;
