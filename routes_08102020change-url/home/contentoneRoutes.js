var express = require("express");
var router = express();
var path = require("path");
const session = require("express-session");
var multer = require("multer");
var sharp = require("sharp");
var checkLogin = require("../../middleware/check");

const {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
  insertmetadata,
} = require("../../models/Commonmodel");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
// var url = "mongodb://localhost:27017/it_training";
const { ObjectID } = require("mongodb");

var imagec = "";

router.use("/uploads", express.static(__dirname + "/uploads"));
// router.use("/uploads", express.static(__dirname + "/uploads"));
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
    // setTimeout(function () {
    //   sharp("./uploadimg/" + imagec)
    //     .resize(250, 250)
    //     .toFile("./uploadimg/400x250" + "/middile_" + imagec);
    // }, 1500);
  },
});

var upload = multer({ storage: storage });

router.get("/ourpartners", checkLogin, function (req, res, next) {
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

    dbo.collection("homecontent").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("home/contentoneform.html", {
        title: "ourpartners",
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

router.post("/ourparterns", (req, res, next) => {
  var myobj = {
    oid: "1",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    logoheading: req.body.logoheading.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertdata("homecontent", myobj, showm);
  req.flash("message", "Content updated successfully");
  return res.redirect("/ourpartners");
});

router.post(
  "/patnerlogoupload",
  upload.array("userPhoto"),
  (req, res, next) => {
    var fullUrl = req.protocol + "://" + req.get("host");
    const file = req.files;

    var imagearr = [];
    file.forEach((element) => {
      sharp("./uploadimg/" + element.filename)
        .resize(100, 40)
        .toFile("./uploadimg/400x250" + "/middile_" + element.filename);

      var uploadimg = {
        type: "gallery",
        parentid: req.body.parentid.trim(),
        imagename: element.filename,
        url: fullUrl + "/uploadimg/400x250/" + element.filename,
      };
      let showm = "";
      insertnewdata("homecontent", uploadimg, showm);
      req.flash("message", "Content inserted successfully");
    });

    return res.redirect("/ourpartners");
  }
);

router.post("/reviews", upload.single("userPhoto"), (req, res, next) => {
  const file = req.file;

  var imagepath = "";
  if (file && !file.length) {
    imagepath = file.filename;
  }

  sharp("./uploadimg/" + file.filename)
    .resize(400, 250)
    .toFile("./uploadimg/400x250" + "/middile_" + file.filename);

  var videodata = {
    type: req.body.review.trim(),
    name: req.body.name.trim(),
    designation: req.body.designation.trim(),
    description: req.body.description.trim(),
    videourl: req.body.videourl.trim(),
    videoupload: imagepath,
    imagemiddile: "middile_" + imagepath,
    createAt: new Date(),
    updateAt: new Date(),
  };
  let showm = "";
  insertnewdata("homecontent", videodata, showm);
  req.flash("message", "Content inserted successfully");
  return res.redirect("/ourpartners");
});

router.post(
  "/reviewupdate",
  upload.single("userPhoto"),
  async function (req, res, next) {
    const file = req.file;
    var imagepath = "";
    if (req.body.preimage != "") {
      imagepath = req.body.preimage;
    }
    if (file && !file.length) {
      imagepath = file.filename;
    }
    // if (req.body.preimage == "") {
    sharp("./uploadimg/" + imagepath)
      .resize(400, 250)
      .toFile("./uploadimg/400x250" + "/middile_" + imagepath);
    // }
    var myobj = {
      type: req.body.review.trim(),
      name: req.body.name.trim(),
      designation: req.body.designation.trim(),
      description: req.body.description.trim(),
      videourl: req.body.videourl.trim(),
      videoupload: imagepath,
      imagemiddile: "middile_" + imagepath,
      updateAt: new Date(),
    };

    var upid = req.body.editid;
    let showm = "";
    updatedata("homecontent", upid, myobj, showm);
    req.flash("message", "Item updated successfully");
    return res.redirect("/ourpartners");
  }
);

router.get("/achievement", checkLogin, function (req, res, next) {
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

    var itemarr = [];
    dbo
      .collection("achievement")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        itemarr = result2;
      });

    dbo.collection("achievement").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("home/contenttwoform.html", {
        title: "header",
        opt: option,
        pagedata: result,
        users: userlogin,
        tablecontent: itemarr,
        logedin: session.email,
        message: req.flash("message"),
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post("/achievement", (req, res, next) => {
  var myobj = {
    oid: "1",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
  };
  showm = "";
  insertdata("achievement", myobj, showm);

  req.flash("message", "Content updated successfully");
  return res.redirect("/achievement");
});

router.post("/achievementitem", (req, res, next) => {
  var myobj = {
    type: "item",
    title: req.body.title.trim(),
    numofdata: req.body.numofdata.trim(),
    range: req.body.range.trim(),
  };
  let showm = "";
  insertnewdata("achievement", myobj, showm);
  req.flash("message", "Content inserted successfully");
  return res.redirect("/achievement");
});

router.get("/job", checkLogin, function (req, res, next) {
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

    var itemarr = [];
    dbo
      .collection("jobguarantee")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        itemarr = result2;
      });

    dbo
      .collection("jobguarantee")
      .findOne({ oid: "1" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("home/contentthiredform.html", {
          title: "header",
          opt: option,
          pagedata: result,
          users: userlogin,
          tablecontent: itemarr,
          logedin: session.email,
          message: req.flash("message"),
        });
        setTimeout(function () {
          session.massage = "";
        }, 5000);
      });
  });
});

router.post("/jobguarantee", (req, res, next) => {
  var myobj = {
    oid: "1",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
  };
  let showm = "";
  insertdata("jobguarantee", myobj, showm);
  req.flash("message", "Content updated successfully");
  return res.redirect("/job");
});

router.post(
  "/jobguaranteeitem",
  upload.single("userPhoto"),
  (req, res, next) => {
    const file = req.file;
    var imagepath = "";
    if (file && !file.length) {
      imagepath = file.filename;
    }

    sharp("./uploadimg/" + file.filename)
      .resize(400, 250)
      .toFile("./uploadimg/400x250" + "/middile_" + file.filename);

    var myobj = {
      type: "item",
      heading: req.body.heading.trim(),
      point1: req.body.point1.trim(),
      point2: req.body.point2.trim(),
      image: imagepath,
      imagemiddile: "middile_" + imagepath,
    };
    let showm = "";
    insertnewdata("jobguarantee", myobj, showm);
    req.flash("message", "Content inserted successfully");
    return res.redirect("/job");
  }
);

// ajax updated code......
router.get("/getjobguaranteebyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("jobguarantee")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/jobguaranteeitemupdate",
  upload.single("userPhoto"),
  async function (req, res, next) {
    const file = req.file;
    var imagepath = "";
    if (req.body.preimage != "") {
      imagepath = req.body.preimage;
    }
    if (file && !file.length) {
      imagepath = file.filename;
    }

    if (req.body.preimage == "") {
      sharp("./uploadimg/" + file.filename)
        .resize(400, 250)
        .toFile("./uploadimg/400x250" + "/middile_" + file.filename);
    }

    var myobj = {
      type: "item",
      heading: req.body.heading.trim(),
      point1: req.body.point1.trim(),
      point2: req.body.point2.trim(),
      image: imagepath,
      imagemiddile: "middile_" + imagepath,
    };
    var upid = req.body.editid;
    let showm = "";
    updatedata("jobguarantee", upid, myobj, showm);
    req.flash("message", "Item updated successfully");
    return res.redirect("/job");
  }
);

router.get("/educator", checkLogin, function (req, res, next) {
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

    var itemarr = [];
    dbo
      .collection("educator")
      .find({ type: "item" })
      .toArray(function (err, result2) {
        itemarr = result2;
      });

    dbo.collection("educator").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("home/contentfourform.html", {
        title: "educator",
        opt: option,
        pagedata: result,
        users: userlogin,
        tablecontent: itemarr,
        logedin: session.email,
        message: req.flash("message"),
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post("/besteducator", (req, res, next) => {
  var myobj = {
    oid: "1",
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
  };
  let showm = "";
  insertdata("educator", myobj, showm);
  req.flash("message", "Content updated successfully");
  return res.redirect("/educator");
});

router.post(
  "/besteducatorlist",
  upload.single("userPhoto"),
  (req, res, next) => {
    var myobj = {
      type: "item",
      title: req.body.title.trim(),
    };
    let showm = "";
    insertnewdata("educator", myobj, showm);
    req.flash("message", "Content inserted successfully");
    return res.redirect("/educator");
  }
);

router.get("/homemeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "home" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("home/metatag.html", {
          title: "ourpartners",
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

router.post("/homemetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "home",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "home");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/homemeta");
});

// ajax updated code.......
// getblogbyid
router.get("/getcontentbyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("homecontent")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getjobguaranteebyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var aid = req.params.id;
    dbo
      .collection("jobguarantee")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

// delete then data from database

router.get("/contentremove/:id", async function (req, res, next) {
  showm = "Deleted successfully";
  req.flash("message", "Deleted successfully");
  deletebyid("homecontent", req.params.id, showm);
  res.redirect("/ourpartners");
});

router.get("/contenttworemove/:id", async function (req, res, next) {
  deletebyid("achievement", req.params.id);
  req.flash("message", "Achievement deleted successfully");
  res.redirect("/achievement");
});

router.get("/contentthiredremove/:id", async function (req, res, next) {
  deletebyid("jobguarantee", req.params.id);
  req.flash("message", "Job guarantee deleted successfully");
  res.redirect("/job");
});

router.get("/contentfourremove/:id", async function (req, res, next) {
  showm = "Deleted successfull";
  req.flash("message", "Educator deleted successfully");
  deletebyid("educator", req.params.id, showm);
  res.redirect("/educator");
});

// api call for all data contentone ===============================

router.get("/gotrecently", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("homecontent").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/getreview", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("homecontent")
      .find({ type: "review" })
      .sort({ updateAt: -1 })
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getpatnerimage/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("homecontent")
      .find({ type: "gallery" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

// api call for all data educator ===============================

router.get("/geteducator", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("educator").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/geteducator/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("educator")
      .find({ type: "item" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

// api call for all data Job Guarantee ===============================

router.get("/getjobguarantee", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("jobguarantee")
      .findOne({ oid: "1" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getjobguarantee/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("jobguarantee")
      .find({ type: "item" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

// api call for all data Job Achievements ===============================

router.get("/getachievement", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("achievement").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.get("/getachievement/:l", function (req, res, next) {
  var limit = req.params.l;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("achievement")
      .find({ type: "item" })
      .limit(Number(limit))
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
