var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
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

router.get("/maincategory", checkLogin, function (req, res, next) {
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
        .collection("categories")
        .find({ type: "item" })
        .toArray(function (err, result2) {
          reviews = result2;
        });

      dbo
        .collection("categories")
        .findOne({ oid: "1" }, function (err, result) {
          if (err) {
            return;
          }
          console.log(err);

          res.render("category/maincategoryform.html", {
            title: "category",
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
  }, 2000);
});

router.post("/addmaincategory", async (req, res, next) => {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("categories")
      .count({ parent_id: "0" }, function (err, result) {
        categoryID = result;

        var insertitemdata = {
          parent_id: "0",
          index: categoryID + 1,
          categoryname: req.body.categoryname.trim(),
          displayname: req.body.displayname.trim(),
          description: req.body.description.trim(),
        };
        let showm = "";

        insertnewdata("categories", insertitemdata, showm);
      });
  });
  req.flash("message", "Category inserted successfully");
  return res.redirect("/maincategory");
});

router.get("/categorymainremove/:catid/:id", async function (req, res, next) {
  deletebyid("categories", req.params.id);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("categories").deleteMany({ categoryid: req.params.catid });
  });
  req.flash("message", "All category deleted successfully");
  res.redirect("/category");
});

router.get("/categoryremove/:id", async function (req, res, next) {
  deletebyid("categories", req.params.id);
  req.flash("message", "Category deleted successfully");
  res.redirect("/category");
});

// category main part and category add item one by one

router.get("/category", checkLogin, function (req, res, next) {
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
      .collection("categories")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        reviews = result2;
      });

    dbo.collection("categories").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("category/categoryform.html", {
        title: "category",
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

router.post("/category", (req, res, next) => {
  var myobj = {
    oid: "1",
    pagetitle: req.body.pagetitle.trim(),
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
  };
  let showm = "";
  insertdata("categories", myobj, showm);
  req.flash("message", "Main category content updated successfully");
  return res.redirect("/category");
});

router.post("/addcategory", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";

  if (file && !file.length) {
    imagepath = file.filename;
  }

  var insertitemdata = {
    type: req.body.item.trim(),
    heading: req.body.heading.trim(),
    color: req.body.color.trim(),
    description: req.body.description.trim(),
    categoryid: Number(req.body.categoryid),
    image: imagepath,
  };
  let showm = "";
  insertnewdata("categories", insertitemdata, showm);
  req.flash("message", "Main category inserted successfully");
  return res.redirect("/category");
});

router.get("/getcategorybyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("categories")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        if (result) {
          // console.log(result.categoryid);
          dbo
            .collection("categories")
            .findOne({ index: Number(result.categoryid) }, function (err, cat) {
              result.categoryname = "";
              // console.log(cat.length);
              if (Number(result.categoryid) > 0) {
                result.categoryname = cat.categoryname;
              }
              res.status(200).json(result);
            });
        }
      });
  });
});

router.post(
  "/categoryitemupdate",
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
        type: req.body.item.trim(),
        heading: req.body.heading.trim(),
        description: req.body.description.trim(),
        color: req.body.color.trim(),
        categoryid: Number(req.body.categoryid1),
        image: imagepath,
      };

      var upid = req.body.editid;
      let showm = "";
      req.flash("message", "Category item updated successfully");
      updatedata("categories", upid, myobj, showm);
      return res.redirect("/category");
    });
  }
);

router.get("/categorymeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "category" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("category/metatag.html", {
          title: "course",
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

router.post("/categorymetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "category",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "category");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/categorymeta");
});

// api call for all data ===============================

router.get("/getcategory/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("categories")
      .find({ parent_id: "0" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getallcategory", function (req, res, next) {
  // console.log("dfds", req.params.l);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("categories")
      .find()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getcategoryitem/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("categories")
      .find({ type: "item" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getcategorysearch/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("categories")
      .find({
        $or: [
          { type: { $regex: limit, $options: "i" } },
          { heading: { $regex: limit, $options: "i" } },
          { description: { $regex: limit, $options: "i" } },
          { categoryname: { $regex: limit, $options: "i" } },
          { categoryid: { $regex: limit, $options: "i" } },
          { index: { $regex: limit, $options: "i" } },
          { displayname: { $regex: limit, $options: "i" } },
        ],
      })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getsearch", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("categories")
      .aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "designation",
            foreignField: "categoryname",
            as: "address",
          },
        },
        { $unwind: "$address" },
        {
          $project: {
            _id: 1,
            categoryname: 1,
            "courses.designation": 1,
          },
        },
      ])
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getallmargedata", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("categories")
      .aggregate([
        { $limit: 1 },
        { $project: { _id: 1 } },

        {
          $lookup: {
            from: "courses",
            pipeline: [{ $set: { _id: "$_id" } }],
            as: "Collection1",
          },
        },
        {
          $lookup: {
            from: "categories",
            pipeline: [{ $set: { _id: "$_id" } }],
            as: "Collection2",
          },
        },
        {
          $lookup: {
            from: "tbblog",
            pipeline: [{ $set: { _id: "$_id" } }],
            as: "Collection3",
          },
        },
        {
          $project: {
            Union: {
              $concatArrays: ["$Collection1", "$Collection2", "$Collection3"],
            },
          },
        },

        { $unwind: "$Union" },
        { $replaceRoot: { newRoot: "$Union" } },
      ])
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getmarge/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("categories")
      .aggregate([
        { $limit: 1 },
        { $project: { _id: 1 } },
        {
          $lookup: {
            from: "courses",
            pipeline: [
              {
                $match: {
                  $or: [
                    { type: { $regex: limit, $options: "i" } },
                    { heading: { $regex: limit, $options: "i" } },
                    { description: { $regex: limit, $options: "i" } },
                    { categoryname: { $regex: limit, $options: "i" } },
                    { categoryid: { $regex: limit, $options: "i" } },
                    { index: { $regex: limit, $options: "i" } },
                    { displayname: { $regex: limit, $options: "i" } },
                  ],
                },
              },
              { $set: { _id: "$_id" } },
            ],
            as: "Collection1",
          },
        },
        {
          $lookup: {
            from: "categories",
            pipeline: [
              {
                $match: {
                  $or: [
                    { type: { $regex: limit, $options: "i" } },
                    { heading: { $regex: limit, $options: "i" } },
                    { description: { $regex: limit, $options: "i" } },
                    { categoryname: { $regex: limit, $options: "i" } },
                    { categoryid: { $regex: limit, $options: "i" } },
                    { index: { $regex: limit, $options: "i" } },
                    { displayname: { $regex: limit, $options: "i" } },
                  ],
                },
              },
              { $set: { _id: "$_id" } },
            ],
            as: "Collection2",
          },
        },
        {
          $lookup: {
            from: "tbblog",
            pipeline: [
              {
                $match: {
                  $or: [
                    { heading: { $regex: limit, $options: "i" } },
                    { description: { $regex: limit, $options: "i" } },
                  ],
                },
              },
              { $set: { _id: "$_id" } },
            ],
            as: "Collection3",
          },
        },
        {
          $project: {
            Union: {
              $concatArrays: ["$Collection1", "$Collection2", "$Collection3"],
            },
          },
        },
        { $unwind: "$Union" },
        { $replaceRoot: { newRoot: "$Union" } },
      ])
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/categorymetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "category" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
