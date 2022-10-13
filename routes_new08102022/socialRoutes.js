var express = require("express");
var router = express();
var path = require("path");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var sharp = require("sharp");
var checkLogin = require("../middleware/check");

const {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
} = require("../models/Commonmodel");

var multer = require("multer");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/it_training";
var { ObjectID } = require("mongodb");

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

router.get("/social", checkLogin, (req, res, next) => {
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
      .collection("socials")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("common/socialmediaform.html", {
          title: "social",
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

router.post("/social", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";

  if (file && !file.length) {
    imagepath = file.filename;
  }

  var insertitemdata = {
    title: req.body.title.trim(),
    socialurl: req.body.socialurl.trim(),
    description: req.body.description.trim(),
    image: imagepath,
    imagemiddile: "middile_" + imagepath,
    createAt: new Date(),
  };
  let showm = "";
  insertnewdata("socials", insertitemdata, showm);
  req.flash("message", "Social media inserted successfully");
  return res.redirect("/social");
});

router.get("/getsocialbyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("socials")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/updatesocial",
  upload.single("userPhoto"),
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("it_training");

      const file = req.file;
      var imagepath = "";
      if (req.body.preimage != "") {
        imagepath = req.body.preimage;
      }
      if (file && !file.length) {
        imagepath = file.filename;
      }

      var myobj = {
        title: req.body.title.trim(),
        socialurl: req.body.socialurl.trim(),
        description: req.body.description.trim(),
        image: imagepath,
        imagemiddile: "middile_" + imagepath,
        updateAt: new Date(),
      };

      var upid = req.body.editid;
      let showm = "";
      updatedata("socials", upid, myobj, showm);
      req.flash("message", "Social updated successfully");
      return res.redirect("/social");
    });
  }
);

router.get("/socialremove/:id", async function (req, res, next) {
  deletebyid("socials", req.params.id);
  session.message = "";
  req.flash("message", "Social deleted successfully");
  res.redirect("/social");
});

module.exports = router;
