var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");
var sharp = require("sharp");
// const flash = require("connect-flash");

var checkLogin = require("../../middleware/check");
const {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
  insertmetadata,
} = require("../../models/Commonmodel");
const { collection } = require("../../models/Registermodel");

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

try {
  mongoose.connect(
    process.env.MONGODB_URI ||
      `mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority`
  );
  var MongoClient = require("mongodb").MongoClient;
  var url =
    "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
  // var url = "mongodb://localhost:27017/it_training";
  var { ObjectID } = require("mongodb");

  console.log("connected to database.");
} catch (error) {
  console.log("could not connect to database", error);
}

// try {
//   mongoose.connect(
//     process.env.MONGODB_URI || `mongodb://localhost:27017/it_training`
//   );
//   var MongoClient = require("mongodb").MongoClient;
//   var url = "mongodb://localhost:27017/it_training";
//   var { ObjectID } = require("mongodb");

//   console.log("connected to database.");
// } catch (error) {
//   console.log("could not connect to database", error);
// }

router.get("/testimonial", checkLogin, function (req, res, next) {
  setTimeout(function () {
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
        .collection("testimonials")
        .find()
        .toArray(function (err, result) {
          if (err) {
            return;
          }
          console.log(err);

          res.render("testimonial/testimonialform.html", {
            title: "category",
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
  }, 1500);
});

router.post("/addtestimonial", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";

  if (file && !file.length) {
    imagepath = file.filename;
  }

  var insertitemdata = {
    name: req.body.name.trim(),
    designation: req.body.designation.trim(),
    description: req.body.description.trim(),
    company: req.body.company.trim(),
    image: imagepath,
    imagemiddile: "middile_" + imagepath,
    createAt: new Date(),
  };
  let showm = "";
  insertnewdata("testimonials", insertitemdata, showm);
  req.flash("message", "Testimonial inserted successfully");
  return res.redirect("/testimonial");
});

// gettestmonialbyid
router.get("/gettestmonialbyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("testimonials")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

// updatetestimonial
router.post(
  "/updatetestimonial",
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
        name: req.body.name.trim(),
        designation: req.body.designation.trim(),
        description: req.body.description.trim(),
        company: req.body.company.trim(),
        image: imagepath,
        imagemiddile: "middile_" + imagepath,
        updateAt: new Date(),
      };

      var upid = req.body.editid;
      let showm = "";
      updatedata("testimonials", upid, myobj, showm);
      req.flash("message", "Testimonial updated successfully");
      return res.redirect("/testimonial");
    });
  }
);

router.get("/testimonialremove/:id", async function (req, res, next) {
  deletebyid("testimonials", req.params.id);
  session.message = "";
  req.flash("message", "Testimonial deleted successfully");
  res.redirect("/testimonial");
});

router.get("/testimonialmeta", checkLogin, function (req, res, next) {
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

    var reviews = [];
    dbo
      .collection("homecontent")
      .find({ type: "review" })
      .toArray(function (err, result2) {
        reviews = result2;
      });

    var gallerylogo = [];
    dbo
      .collection("homecontent")
      .find({ type: "gallery" })
      .toArray(function (err, result) {
        gallerylogo = result;
      });

    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "testimonial" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("testimonial/metatag.html", {
          title: "testimonial",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          gallery: gallerylogo,
          logedin: session.email,
          message: req.flash("message"),
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

router.post("/testimonialmetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "testimonial",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "testimonial");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/testimonialmeta");
});

// api call for all collection
router.get("/gettestmonial", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("testimonials")
      .find()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/testimonialmetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "testimonial" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
