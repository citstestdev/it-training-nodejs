var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");
var sharp = require("sharp");
const fs = require("fs");
const flash = require("connect-flash");

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

// add mian category

router.get("/blog", checkLogin, async (req, res, next) => {
  await MongoClient.connect(url, function (err, db) {
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
    var helllo = [];

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

      res.render("blog/blogform.html", {
        title: "blog",
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
  // }, 1500);
});

router.post("/blog", upload.single("banner"), (req, res, next) => {
  var fullUrl = req.protocol + "://" + req.get("host");
  var bannerimage = "";
  const file = req.file;

  if (req.body.oldimage != "") {
    bannerimage = req.body.oldimage;
  }

  if (file && !file.length) {
    bannerimage = file.filename;
  }

  var myobj = {
    oid: "1",
    pagetitle: req.body.pagetitle.trim(),
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    banner: bannerimage,
    createAt: new Date(),
  };
  let showm = "";
  insertdata("tbblog", myobj, showm);
  req.flash("message", "Blog content updated successfully");
  return res.redirect("/blog");
});

router.post("/addblog", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";

  if (file && !file.length) {
    imagepath = file.filename;
  }

  var insertitemdata = {
    uid: session.userid,
    type: req.body.item.trim(),
    heading: req.body.heading.trim(),
    bslugname: req.body.bslugname.trim().toLowerCase().replace(/ /g, "-"),
    blogtype: req.body.blogtype.trim(),
    description: req.body.description.trim(),
    image: imagepath,
    imagemiddile: "middile_" + imagepath,
    createAt: new Date(),
  };

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    // console.log("DSF", req.body.heading.trim());
    dbo
      .collection("tbblog")
      .findOne({ heading: req.body.heading.trim() }, function (err, result) {
        if (!result) {
          let showm = "";
          insertnewdata("tbblog", insertitemdata, showm);
          req.flash("message", "Blog inserted successfully");
          return res.redirect("/blog");
        } else {
          // session.massage = "Heading already exist!";
          req.flash("message", "Heading already exist!");
          return res.redirect("/blog");
        }
      });
  });
});

router.get("/blogmeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "blog" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("blog/metatag.html", {
          title: "blog",
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

router.post("/blogmetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "blog",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "blog");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/blogmeta");
});

router.get("/getblogbyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("tbblog")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/blogitemupdate",
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
        uid: session.userid,
        type: "item",
        heading: req.body.heading.trim(),
        bslugname: req.body.bslugname.trim().toLowerCase().replace(/ /g, "-"),
        blogtype: req.body.blogtype.trim(),
        description: req.body.description.trim(),
        image: imagepath,
        imagemiddile: "middile_" + imagepath,
        update: new Date(),
      };

      var upid = req.body.editid;
      let showm = "";
      dbo.collection("tbblog").findOne(
        {
          $and: [
            { _id: { $ne: ObjectID(upid) } },
            {
              bslugname: req.body.bslugname
                .trim()
                .toLowerCase()
                .replace(/ /g, "-"),
            },
          ],
        },
        function (err, result) {
          if (!result) {
            updatedata("tbblog", upid, myobj, showm);
            req.flash("message", "Blog updated successfully");
            return res.redirect("/blog");
          } else {
            // session.massage = "";
            req.flash("message", "Slug already exist!");
            return res.redirect("/blog");
          }
        }
      );
    });
  }
);

router.get("/blogremove/:id", async function (req, res, next) {
  deletebyid("tbblog", req.params.id);
  req.flash("message", "Blog deleted successfully");
  res.redirect("/blog");
});

// api call for all data blog ===============================

router.get("/getblog", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("tbblog").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/getblog/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbblog")
      .find({ type: "item" })
      .limit(Number(limit))
      .sort({ _id: -1 })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/blogsingle/:slug", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbblog")
      .findOne({ bslugname: req.params.slug }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/blogmetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "blog" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
