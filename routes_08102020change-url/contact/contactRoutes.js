var express = require("express");
var router = express();
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
var multer = require("multer");
const nodemailer = require("nodemailer");

var checkLogin = require("../../middleware/check");
const {
  insertdata,
  insertnewdata,
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
//   var { ObjectID, ConnectionCreatedEvent } = require("mongodb");

//   console.log("connected to database.");
// } catch (error) {
//   console.log("could not connect to database", error);
// }

router.get("/contact", checkLogin, function (req, res, next) {
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

    dbo.collection("contact").findOne({ oid: "1" }, function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("contact/contactform.html", {
        title: "contact",
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
router.post("/createcontact", async function (req, res, next) {
  // mapdata
  var myobj = {
    oid: "1",
    pagetitle: req.body.pagetitle.trim(),
    heading: req.body.heading.trim(),
    description: req.body.description.trim(),
    formheading: req.body.formheading.trim(),
    formdescription: req.body.formdescription.trim(),
    mapdata: req.body.mapdata.trim(),
    officetime: req.body.officetime.trim(),
    createAt: new Date(),
  };
  let showm = "";
  insertdata("contact", myobj, showm);
  req.flash("message", "Contact updated successfully");
  return res.redirect("/contact");
});

router.get("/contactperson", checkLogin, function (req, res, next) {
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
      .collection("contact")
      .find({ oid: { $ne: "1" } })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("contact/contactall.html", {
          title: "contact page",
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

router.post("/createperson", async function (req, res, next) {
  var myobj = JSON.parse(req.body.body);

  var adminMail = "";

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo.collection("users").findOne({ role: 1 }, function (err, result) {
      adminMail = result.email;

      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "citstestdev@gmail.com",
          pass: "cuxgzqlrnucrsdry",
        },
      });

      let from = myobj.email;
      let to = adminMail;

      if (myobj.mtype === "contact") {
        var message = "";
        message += "<table>";
        message += "<tr><th><h3>Hello Sir,</h3></th></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Name : </td><td>" +
          myobj.name +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Email : </td><td>" +
          myobj.email +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Phone : </td><td>" +
          myobj.phone +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Category : </td><td>" +
          myobj.designation +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Message : </td><td>" +
          myobj.message +
          " </td></tr>";
        message += "</table>";

        var mailOptions = {
          from: "It-Training" + from,
          to: to,
          subject: "Sending Email For Contact",
          html: message,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          var showm = "";
          insertnewdata("contact", myobj, showm);
          console.log("Message sent: %s", info.messageId);
        });
      }

      if (myobj.mtype === "keystroke") {
        var message = "";
        message += "<table>";
        message += "<tr><th><h3>Hello Sir,</h3></th></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Name : </td><td>" +
          myobj.name +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Email : </td><td>" +
          myobj.email +
          " </td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Phone : </td><td>" +
          myobj.phone +
          "</td></tr>";
        message +=
          "<tr><td style='margin-left:200px'>Category : </td><td>" +
          myobj.designation +
          " </td></tr>";
        message += "</table>";

        var mailOptions = {
          from: "It-Training" + from,
          to: to,
          subject: "Sending Email For Keystroke Quote",
          html: message,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          var showm = "";
          insertnewdata("contact", myobj, showm);
          console.log("Message sent: %s", info.messageId);
        });
      }
    });
  });
  // return res.redirect("/contact");
});

router.post("/createcurious", async function (req, res, next) {
  var myobj = JSON.parse(req.body.body);

  var adminMail = "";

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    // var userlogin = [];
    dbo.collection("users").findOne({ role: 1 }, function (err, result) {
      adminMail = result.email;

      let from = myobj.email;
      let to = adminMail;

      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "citstestdev@gmail.com",
          pass: "cuxgzqlrnucrsdry",
        },
      });

      var message = "";
      message += "<table>";
      message += "<tr><th><h3>Hello Sir,</h3></th></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Name : </td><td>" +
        myobj.name +
        "</td></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Email : </td><td>" +
        myobj.email +
        " </td></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Phone : </td><td>" +
        myobj.phone +
        " </td></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Course : </td><td>" +
        myobj.course +
        " </td></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Duration : </td><td>" +
        myobj.duration +
        " </td></tr>";
      message +=
        "<tr><td style='margin-left:200px'>Message : </td><td>" +
        myobj.message +
        " </td></tr>";
      message += "</table>";

      var mailOptions = {
        from: "It-Training" + from,
        to: to,
        subject: "Send Email For Curious",
        html: message,
      };

      // console.log("mailOptions", mailOptions);

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        var showm = "";
        insertnewdata("curiousenquiry", myobj, showm);
        console.log("Message sent: %s", info.messageId);
      });
    });
  });
});

router.get("/contactmeta", checkLogin, function (req, res, next) {
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
      .findOne({ oid: "1", type: "contact" }, function (err, result) {
        if (err) {
          return;
        }
        console.log(err);

        res.render("contact/metatag.html", {
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

router.post("/contactmetatagupdate", (req, res, next) => {
  var myobj = {
    oid: "1",
    type: "contact",
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    keyword: req.body.keyword.trim(),
  };

  // console.log("obj", myobj);
  let showm = "";
  insertmetadata("metatag", myobj, showm, "contact");
  req.flash("message", "Meta tags updated successfully");
  return res.redirect("/contactmeta");
});

router.get("/contactdata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("contact").findOne({ oid: "1" }, function (err, result) {
      res.status(200).json(result);
    });
  });
});

router.post("/createnewsletter", async function (req, res, next) {
  var myobj = JSON.parse(req.body.body);
  var adminMail = "";

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    // var userlogin = [];
    dbo.collection("users").findOne({ role: 1 }, function (err, result) {
      adminMail = result.email;

      var from = myobj.email;
      var to = adminMail;

      const nodemailer = require("nodemailer");

      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "citstestdev@gmail.com",
          pass: "cuxgzqlrnucrsdry",
        },
      });

      var message = "";
      message += "<div>E-Mail : " + from + " </div>";

      var mailOptions = {
        from: "It-Training" + from,
        to: to,
        subject: "Subscribe to the free newsletter",
        html: message,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        var showm = "";
        insertnewdata("tbnewletter", myobj, showm);
        console.log("Message sent: %s", info.messageId);
      });
    });
  });
  // return res.redirect("/home");
});

router.get("/contactmetadata", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("metatag")
      .findOne({ oid: "1", type: "contact" }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
