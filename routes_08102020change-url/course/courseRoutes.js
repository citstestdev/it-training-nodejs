var express = require("express");
var router = express();
const mongoose = require("mongoose");
const fs = require("fs");
var path = require("path");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");
var nodemailer = require("nodemailer");
var sharp = require("sharp");
const flash = require("connect-flash");

var checkLogin = require("../../middleware/check");
var passModel = require("../../models/add_password");
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

router.get("/course", checkLogin, function (req, res, next) {
  setTimeout(function () {
    // console.log("DFDSF", session.message);
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
        .collection("courses")
        .find({ type: "item" })
        .toArray(function (err, result2) {
          reviews = result2;
        });

      dbo.collection("courses").findOne({ oid: "1" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("course/courseform.html", {
          title: "course",
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

router.post("/course", upload.single("banner"), (req, res, next) => {
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
    btnheading: req.body.btnheading.trim(),
    banner: bannerimage,
  };
  let showm = "";
  insertdata("courses", myobj, showm);
  req.flash("message", "Course content updated successfully");
  return res.redirect("/course");
});

router.post("/addcourse", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";

  if (file && !file.length) {
    imagepath = file.filename;
  }

  var insertitemdata = {
    type: req.body.item.trim(),
    heading: req.body.heading.trim(),
    slugname: req.body.slugname.trim().toLowerCase().replace(/ /g, "-"),
    designation: req.body.designation.trim(),
    description: req.body.description.trim(),
    duration: req.body.duration.trim(),
    batchstart: req.body.batchstart.trim(),
    batchsize: req.body.batchsize.trim(),
    image: imagepath,
    imagemiddile: "middile_" + imagepath,
    createAt: new Date(),
    updateAt: new Date(),
  };

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo.collection("courses").findOne(
      {
        slugname: req.body.slugname.trim().toLowerCase().replace(/ /g, "-"),
      },
      function (err, result) {
        if (!result) {
          let showm = "";
          req.flash("message", "Course inserted successfully");
          insertnewdata("courses", insertitemdata, showm);
          return res.redirect("/course");
        } else {
          // session.massage = "Slug already exist!";
          req.flash("message", "Slug already exist!");
          return res.redirect("/course");
        }
      }
    );
  });
});

router.get("/getparticulerdatabyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("courses")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/courseitemupdate",
  upload.single("userPhoto"),
  (req, res, next) => {
    const file = req.file;
    var imagepath = "";
    if (req.body.preimage != "") {
      imagepath = req.body.preimage;
    }
    if (file && !file.length) {
      imagepath = file.filename;
    }

    var upid = req.body.editid;
    var myobj = {
      type: req.body.item.trim(),
      heading: req.body.heading.trim(),
      slugname: req.body.slugname.trim().toLowerCase().replace(/ /g, "-"),
      designation: req.body.designation.trim(),
      description: req.body.description.trim(),
      duration: req.body.duration.trim(),
      batchstart: req.body.batchstart.trim(),
      batchsize: req.body.batchsize.trim(),
      image: imagepath,
      imagemiddile: "middile_" + imagepath,
      updateAt: new Date(),
    };

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("it_training");

      dbo.collection("courses").findOne(
        {
          $and: [
            { _id: { $ne: ObjectID(upid) } },
            {
              slugname: req.body.slugname
                .trim()
                .toLowerCase()
                .replace(/ /g, "-"),
            },
          ],
        },
        function (err, result) {
          if (!result) {
            let showm = "";
            req.flash("message", "Course item updated successfully");
            updatedata("courses", upid, myobj, showm);
            return res.redirect("/course");
          } else {
            req.flash("message", "Slug already exist!");
            return res.redirect("/course");
          }
        }
      );
    });
  }
);

router.get("/courseitemdel/:id", async function (req, res, next) {
  deletebyid("courses", req.params.id);
  req.flash("message", "Course deleted successfully");
  res.redirect("/course");
});

router.post("/coursecontact", async function (req, res, next) {
  var fieldname = JSON.parse(req.body.body);

  var coursedata = {
    courseid: ObjectID(fieldname.courseid),
    name: fieldname.name.trim(),
    email: fieldname.email.trim(),
    phone: fieldname.phone.trim(),
    message: fieldname.message.trim(),
  };

  let showm = "";
  insertnewdata("tbcoursecontact", coursedata, showm);

  // var transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 587,
  //   secure: false,
  //   requireTLS: true,
  //   auth: {
  //     user: "citstestdev@gmail.com",
  //     pass: "conative@16",
  //   },
  // });

  // var mailOptions = {
  //   from: "citstestdev@gmail.com",
  //   to: "citstestdev@gmail.com",
  //   subject: "Sending Email using Node.js",
  //   text: "That was easy!",
  // };

  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  // });

  return res.redirect("/contact");
});

router.get("/coursemeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "course" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("course/metatag.html", {
          title: "course",
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

router.post("/coursemetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "course",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "course");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/coursemeta");
});

// api call for all collection

router.get("/getpageheading", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("courses").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/getcourses/:l", function (req, res, next) {
  var flimit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("courses")
      .find({ type: "item" })
      .limit(Number(flimit))
      .sort({ updateAt: -1 })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getEnrolled/:courseid", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbcoursecontact")
      .find({ slugname: req.params.courseid })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/courses-detail/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("courses")
      .findOne({ _id: ObjectID(req.params.id) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/courses/:slug", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("courses")
      .findOne({ slugname: req.params.slug }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/relatedcourse/:related", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    // var total = dbo.collection("courses").find({});
    // var random = Math.floor(Math.random() * total);
    var courselen;
    dbo
      .collection("courses")
      .find({ designation: req.params.related })
      .toArray(function (err, result) {
        courselen = result.length;
        // console.log("sds", courselen);
        var random = Math.floor(Math.random() * courselen);
        // console.log("saaadsssssssssss", random);
        dbo
          .collection("courses")
          .find({ designation: req.params.related })
          .skip(random)
          .limit(4)
          .toArray(function (err, result) {
            res.status(200).json(result);
          });
      });
  });
});

router.get("/getcoursefilter/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("courses")
      .find({ designation: { $regex: limit, $options: "i" } })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

// pagination with server site

router.get("/view-all/", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var perPage = 1;
    var page = req.params.page || 1;

    dbo
      .collection("courses")
      .find({ type: "item" })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .toArray(function (err, data) {
        if (err) throw err;
        dbo
          .collection("courses")
          .find({ type: "item" })
          .toArray(function (err, result2) {
            res.render("course/cpagination.html", {
              records: data,
              current: page,
              pages: Math.ceil(result2.length / perPage),
            });
          });
      });
  });
});

router.get("/view-all/:page", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var perPage = 1;
    var page = req.params.page || 1;

    dbo
      .collection("courses")
      .find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .toArray(function (err, data) {
        if (err) throw err;
        dbo
          .collection("courses")
          .find({ type: "item" })
          .toArray(function (err, result2) {
            res.render("course/cpagination.html", {
              records: data,
              current: page,
              pages: Math.ceil(result2.length / perPage),
            });
          });
      });
  });
});

// faq code start

router.get("/faq", checkLogin, function (req, res, next) {
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
      .collection("tbfaq")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("faq/faqform.html", {
          title: "faq",
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

// addfaq
router.post("/addfaq", (req, res, next) => {
  var insertitemdata = {
    question: req.body.question.trim(),
    answer: req.body.answer.trim(),
    createAt: new Date(),
  };
  let showm = "";
  insertnewdata("tbfaq", insertitemdata, showm);
  req.flash("message", "FAQ inserted successfully");
  return res.redirect("/faq");
});

router.get("/getFaqdata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("tbfaq")
      .find()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/coursemetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "course" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

// faq code end
module.exports = router;
