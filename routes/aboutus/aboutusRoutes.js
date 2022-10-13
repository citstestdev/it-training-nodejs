var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
var sharp = require("sharp");
var multer = require("multer");
var checkLogin = require("../../middleware/check");

const {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
  insertmetadata,
} = require("../../models/Commonmodel");

router.use("/uploads", express.static(__dirname + "/uploads"));
router.use("/uploadimg", express.static(__dirname + "/uploadimg"));
router.use(
  "/uploadimg/400x250",
  express.static(__dirname + "/uploadimg/400x250")
);

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "userPhoto" || file.fieldname === "featuredPhoto")
      imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, imagec);
  },
});

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "userPhoto" || file.fieldname === "featuredPhoto")
      imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "uploadimg");
  },
  filename: (req, file, cb) => {
    cb(null, imagec);
    setTimeout(function () {
      sharp("./uploadimg/" + imagec)
        .resize(550, 550)
        .toFile("./uploadimg/400x250" + "/middile_" + imagec);
    }, 1000);
  },
});

var upload = multer({ storage: storage });

var tempupload = upload.fields([
  { name: "userPhoto", maxCount: 1 },
  { name: "featuredPhoto", maxCount: 1 },
]);

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
router.get("/about-us", checkLogin, function (req, res, next) {
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

      var allcategory = [];
      dbo
        .collection("categories")
        .find({ parent_id: "0" })
        .toArray(function (err, result2) {
          allcategory = result2;
        });

      var reviews = [];
      dbo
        .collection("tbabout")
        .find({ type: "item" })
        .toArray(function (err, result2) {
          reviews = result2;
        });

      dbo.collection("tbabout").findOne({ oid: "1" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("aboutus/aboutform.html", {
          title: "about-us",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          allcategory: allcategory,
          logedin: session.email,
          message: req.flash("message"),
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
    });
  }, 1000);
});

router.post("/about-us", tempupload, (req, res, next) => {
  var fullUrl = req.protocol + "://" + req.get("host");
  var bannerimage = "";
  var featuredimage = "";

  if (req.body.oldimage != "") {
    bannerimage = req.body.oldimage;
  }

  if (req.body.featimage != "") {
    featuredimage = req.body.featimage;
  }

  if (req.files.userPhoto != undefined) {
    bannerimage = req.files.userPhoto[0].filename;
  }
  if (req.files.featuredPhoto != undefined) {
    featuredimage = req.files.featuredPhoto[0].filename;
  }

  var myobj = {
    pagetitle: req.body.pagetitle.trim(),
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    image: bannerimage,
    featured: featuredimage,
    createAt: new Date(),
  };
  let showm = "";
  insertdata("tbabout", myobj, showm);
  req.flash("message", "About us content updated successfully");
  return res.redirect("/about-us");
});

router.post("/addaboutitem", (req, res, next) => {
  var insertitemdata = {
    type: "item",
    title: req.body.title.trim(),
  };
  let showm = "";
  insertnewdata("tbabout", insertitemdata, showm);
  req.flash("message", "About us item inserted successfully");
  return res.redirect("/about-us");
});

router.get("/aboutremove/:id", async function (req, res, next) {
  deletebyid("tbabout", req.params.id);
  req.flash("message", "About us item deleted successfully");
  res.redirect("/about-us");
});

// about section second
router.get("/about-section-second", checkLogin, function (req, res, next) {
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
      .collection("tbaboutsection")
      .find({ type: "section" })
      .toArray(function (err, result2) {
        reviews = result2;
        // console.log("fdf", reviews);
      });

    dbo
      .collection("tbabout")
      .findOne({ type: "aboutsecond" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("aboutus/aboutsectionsecond.html", {
          title: "about section",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          allcategory: allcategory,
          logedin: session.email,
          message: req.flash("message"),
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

// addaboutsection
router.post("/aboutsecond", upload.single("userPhoto"), (req, res, next) => {
  var bannerimage = "";
  var featuredimage = "";
  const file = req.file;

  if (req.body.oldimage != "") {
    bannerimage = req.body.oldimage;
  }

  if (file && !file.length) {
    bannerimage = file.filename;
  }

  var insertitemdata = {
    type: "aboutsecond",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    placement: req.body.placement.trim(),
    image: bannerimage,
    imagemiddile: "middile_" + bannerimage,
  };
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbabout")
      .findOneAndUpdate(
        { type: "aboutsecond" },
        { $set: insertitemdata },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          session.massage = "";
          req.flash("message", "Content updated successfully");
        }
      );
  });

  return res.redirect("/about-section-second");
});

// about-section-third

// about section
router.get("/about-section-third", checkLogin, function (req, res, next) {
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
      .collection("tbaboutsection")
      .find({ type: "aboutsecond" })
      .toArray(function (err, result2) {
        reviews = result2;
        // console.log("fdf", reviews);
      });

    dbo
      .collection("tbabout")
      .findOne({ type: "aboutthired" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("aboutus/aboutsectionthired.html", {
          title: "about section",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          allcategory: allcategory,
          logedin: session.email,
          message: req.flash("message"),
        });

        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

// addaboutsection
router.post("/aboutthired", upload.single("userPhoto"), (req, res, next) => {
  var bannerimage = "";
  const file = req.file;

  if (req.body.oldimage != "") {
    bannerimage = req.body.oldimage;
  }

  if (file && !file.length) {
    bannerimage = file.filename;
  }

  var insertitemdata = {
    type: "aboutthired",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    image: bannerimage,
    imagemiddile: "middile_" + bannerimage,
  };
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbabout")
      .findOneAndUpdate(
        { type: "aboutthired" },
        { $set: insertitemdata },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          session.massage = "";
          req.flash("message", "Content updated successfully");
        }
      );
  });

  return res.redirect("/about-section-third");
});

// aboutremove
router.get("/aboutsectionremove/:id", async function (req, res, next) {
  deletebyid("tbaboutsection", req.params.id);
  // req.flash("message", "About us item inserted successfully");
  res.redirect("/about-section-second");
});

router.get("/aboutmeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "about" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("aboutus/metatag.html", {
          title: "about",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: reviews,
          gallery: gallerylogo,
          logedin: session.email,
          message: req.flash("message"),
        });
        // console.log("slide", reviews);
        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

router.post("/aboutmetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "about",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  req.flash("message", "Meta tags updated successfully");
  insertmetadata("metatag", myobj, showm, "about");
  return res.redirect("/aboutmeta");
});

router.get("/getaboutus", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("tbabout").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/getaboutusitem", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbabout")
      .find({ type: "item" })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getaboutsecond", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbabout")
      .findOne({ type: "aboutsecond" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getaboutthired", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbabout")
      .findOne({ type: "aboutthired" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/aboutmetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "about" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
