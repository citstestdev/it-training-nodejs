var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var multer = require("multer");
const session = require("express-session");
var sharp = require("sharp");

var checkLogin = require("../middleware/check");

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
    }, 1000);
  },
});

var upload = multer({ storage: storage });

try {
  mongoose.connect(
    process.env.MONGODB_URI ||
      `mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority`
  );
  var MongoClient = require("mongodb").MongoClient;
  var { ObjectID } = require("mongodb");
  var url =
    "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/it_training?retryWrites=true&w=majority";
  // var url = "mongodb://localhost:27017/it_training";

  console.log("connected to database.");
} catch (error) {
  console.log("could not connect to database", error);
}

// if(!session())

router.get("/index", checkLogin, (req, res, next) => {
  let token = req.cookies.token ? true : false;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, async function (err, user) {
        userlogin = user;
      });

    dbo.collection("tb_option").findOne(function (err, result) {
      if (err) {
        return;
      }
      res.render("common/dashboard.html", {
        title: "Dashboard",
        opt: result,
        users: userlogin,
        logedin: session.email,
        message: req.flash("message"),
      });
    });
  });
});

router.get("/", (req, res) => {
  let bad_auth = req.query.msg ? true : false;
  let token = req.cookies.token ? true : false;

  if (token) {
    return res.redirect("/index");
  }
  // if there exists, send the error.
  if (bad_auth) {
    return res.render("common/login.html", {
      error: "Invalid username or password",
    });
  } else {
    // else just render the login
    return res.render("common/login.html", { opt: [] });
  }
});

router.post("/process_login", async (req, res) => {
  // get the data
  let { email, password } = req.body;

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection("users")
      .findOne({ email: email }, async function (err, result) {
        // basic check

        if (!result) {
          return res.redirect("/?msg=fail");
        } else {
          const validPassword = await bcrypt.compare(
            req.body.password,
            result.password
          );
          if (validPassword && email === result.email) {
            var user = {
              _id: result._id,
              email: result.email,
            };
            session.email = result.email;
            session.userid = result._id;

            var token = jwt.sign(user, "seceret");

            res.cookie("token", token);
            res.cookie("email", email);
            // redirect
            req.flash("message", "Login Successfully");
            return res.redirect("/index");
          } else {
            return res.redirect("/?msg=fail");
          }
        }
      });
  });
});

router.get("/register", (req, res, next) => {
  res.render("common/register.html", { msg: session.message });
  setTimeout(function () {
    session.message = "";
  }, 3000);
});

router.post("/adduser", async (req, res, next) => {
  var register = require("../models/Registermodel");

  const { username, email, role } = req.body;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  const newUserObj = { username, email, password, role };
  const newUser = new register(newUserObj);

  newUser.save((saveErr) => {
    if (saveErr) {
      return res.status(412).send({
        success: false,
        message: saveErr,
      });
    } else {
      session.message = "Register successfully";
      // return res.redirect("/register");
      return res.redirect("/users");
    }
  });
});

// profile
router.get("/profile", (req, res, next) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var userlogin = [];
    dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, async function (err, user) {
        userlogin = user;
      });

    dbo.collection("tb_option").findOne(function (err, result) {
      if (err) {
        return;
      }
      res.render("common/profile.html", {
        title: "Profile",
        opt: result,
        users: userlogin,
        logedin: session.email,
        message: req.flash("message"),
      });
    });
  });
});

// profileupdate;checkLogin
router.post("/profileupdate", upload.single("userPhoto"), (req, res, next) => {
  // insertnewdata("users", insertitemdata);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    const file = req.file;
    var imagepath = "";
    if (req.body.oldimage != "") {
      imagepath = req.body.oldimage;
    }

    if (file && !file.length) {
      // Do something
      imagepath = file.filename;
    }

    var insertitemdata = {
      username: req.body.username.trim(),
      email: req.body.email.trim(),
      profile: imagepath,
      imagemiddile: "middile_" + imagepath,
      updateAt: new Date(),
    };

    dbo
      .collection("users")
      .findOneAndUpdate(
        { _id: ObjectID(req.body.userid) },
        { $set: insertitemdata },
        { returnNewDocument: true },
        function (err, res) {
          session.massage = "";
        }
      );
    req.flash("message", "Profile updated successfully");
    return res.redirect("/profile");
  });
});

router.get("/logout", (req, res, next) => {
  res.clearCookie("token");
  res.clearCookie("emai");
  // req.flash("message", "Logout successfully");
  return res.redirect("/");
});

router.get("/option-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    var footerarr = [];
    dbo.collection("tb_option").findOne(function (err, result1) {
      footerarr = result1;
      res.status(200).json(result1);
    });
  });
});

module.exports = router;
