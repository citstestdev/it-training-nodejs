var express = require("express");
var router = express();
var path = require("path");
var multer = require("multer");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
// var url = "mongodb://localhost:27017/it_training";

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

router.get("/testnav", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo.collection("courses").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("testnav.html");

      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.get("/nav", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    // dbo
    //   .collection("tbabout")
    //   .findOne({ type: "aboutthired" }, function (err, result) {
    //     res.status(200).json(result);
    //   });

    // dbo
    //   .collection("testmenu")
    //   .aggregate([
    //     { $sort: { uniqueID: 1 } },
    //     {
    //       $group: {
    //         _id: "$parentID",
    //         children: { $push: "$$ROOT" },
    //       },
    //     },

    //     { $match: { _id: { $gt: 0 } } }, //exclude results where parentID was 0

    //     {
    //       $project: { _id: 0, parentID: 1, lastChild: { $last: "$children" } },
    //     },
    //     { $unwind: "$lastChild" },
    //     { $replaceRoot: { newRoot: "$lastChild" } },
    //   ])
    //   .toArray(function (err, result) {
    //     res.status(200).json(result);
    //   });

    dbo
      .collection("testmenu")
      .aggregate([
        { $sort: { uniqueID: 1 } },
        {
          $group: {
            _id: "$parentID",
            children: { $push: "$$ROOT" },
          },
        },
        // { $match: { _id: { $gt: 0 } } },
        {
          $project: {
            _id: 0,
            parentID: 1,
            Union: {
              $concatArrays: ["$children"],
            },
          },
        },
        { $unwind: "$Union" },
        { $replaceRoot: { newRoot: "$Union" } },
      ])
      .toArray(function (err, result) {
        res.status(200).json(result);
      });

    // dbo
    //   .collection("categories")
    //   .aggregate([
    //     { $limit: 1 },
    //     { $sort: { uniqueID: 1 } },
    //     { $project: { _id: 1 } },

    //     {
    //       $lookup: {
    //         from: "testmenu",
    //         pipeline: [{ $set: { _id: "$_id" } }],
    //         as: "Collection1",
    //       },
    //     },
    //     {
    //       $project: {
    //         Union: {
    //           $concatArrays: ["$Collection1"],
    //         },
    //       },
    //     },

    //     { $unwind: "$Union" },
    //     { $replaceRoot: { newRoot: "$Union" } },
    //   ])
    //   .toArray(function (err, result) {
    //     res.status(200).json(result);
    //   });
  });
});

// router.get("/nav", upload.single("userPhoto"), (req, res, next) => {
//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("it_training");

//     dbo.collection("tb_option").findOne(function (err, result) {
//       if (err) {
//         return;
//       }
//       if (!result) {
//         res.render("common/setting_form.html", {
//           title: "setting",
//           opt: [],
//         });
//         console.log(err);
//       } else {
//         res.render("common/setting_form.html", {
//           title: "setting",
//           opt: result,
//         });
//       }
//     });
//   });
// });

// router.get("/scripts/menu", async function (req, res, next) {
//   console.log("menutree is working");
//   var initial = await Menu.find().populate("parent");
//   var menutree = await Menu.GetMenuTree(
//     initial,
//     null,
//     "5dfe0009551b160edcdc89ce"
//   );
//   await res.status(200).send(menutree);
// });

function creatCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      children: creatCategories(categories, cate._id),
    });
  }

  return categoryList;
}

router.get("/getCategories", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("category")
      .find()
      .toArray(function (err, result) {
        if (result) {
          const catList = creatCategories(result);
          res.status(200).json(catList);
        }
      });
  });
});

module.exports = router;

// db.getCollection('your_collection_name').aggregate([
//     {$sort: {"uniqueID" : 1}},
//     {$group: {
//        _id: "$parentID",
//         children: { $push:  "$$ROOT"  },
//      }},

//      {$match: {_id : {$gt: 0}}}, //exclude results where parentID was 0

//      {
//          $project: {_id: 0, "parentID" : 1, "lastChild" : {$last: "$children"}}
//      },

//      {$replaceRoot: {"newRoot" : "$lastChild"}}
//   ])
