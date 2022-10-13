var createError = require("http-errors");
var express = require("express");
var app = express();
var jwt = require("jsonwebtoken");
const session = require("express-session");
const fs = require("fs");
var path = require("path");
const cors = require("cors");
var multer = require("multer");
const bcrypt = require("bcrypt");
var expressLayout = require("express-ejs-layouts");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const flash = require("connect-flash");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/it_training";
app.use(cookieParser());
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400 },
  })
);
// app.use(
//   session({
//     secret: "secret token",
//     resave: true,
//     saveUninitialized: true,
//     name: "session cookie name",
//     cookie: { maxAge: 86400 },
//     genid: (req) => {},
//   })
// );
app.use(flash());

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("/uploadimg/400x250", express.static(__dirname + "/uploadimg/400x250"));

app.use("/uploadimg", express.static(__dirname + "/uploadimg"));

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", false);
  next();
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(express.static("public"));
app.use(expressLayout);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

const indexRoutes = require("./routes/indexRoutes");
const settingRoutes = require("./routes/settingRoutes");
const socialRoutes = require("./routes/socialRoutes");
const menuRoutes = require("./routes/menuRoutes");
const userRouter = require("./routes/user/userRouter");

// home router
const headerRoutes = require("./routes/home/headerRoutes");
const contentoneRoutes = require("./routes/home/contentoneRoutes");

//  course router
const courseRoutes = require("./routes/course/courseRoutes");

// category router
const categoryRoutes = require("./routes/category/categoryRoutes");

// blog router
const blogRoutes = require("./routes/blog/blogRoutes");

// testimonialsRoutes router
const testimonialsRoutes = require("./routes/testimonial/testimonialsRoutes");

// contact router
const contactRoutes = require("./routes/contact/contactRoutes");

// about us router
const aboutusRoutes = require("./routes/aboutus/aboutusRoutes");

const footerwidgetRoutes = require("./routes/footerwidgetRoutes");

const pagination = require("./routes/pagination");
// const cRoutes = require("./routes/pagination/cRoutes");
// const pagi = require("./routes/pagi");
const AdminRouter = require("./routes/AdminRouter");
const resize = require("./routes/imageresize/resize");

const testnav = require("./routes/navigation/testnav");

app.use("/", indexRoutes);
app.use("/", settingRoutes);
app.use("/", socialRoutes);

app.use("/", menuRoutes);

app.use("/", userRouter);

app.use("/", headerRoutes);
// app.use("/contentone", contentoneRoutes);
app.use("/", contentoneRoutes);

app.use("/", courseRoutes);
app.use("/getcourses/:l", courseRoutes);
app.use("/relatedcourse/:related", courseRoutes);
// app.use("/getEnrolled/:courseid", courseRoutes);
// app.use("/view-all/:page", courseRoutes);
app.use("/", categoryRoutes);
app.use("/", blogRoutes);
app.use("/getsingle/:id", blogRoutes);
app.use("/", testimonialsRoutes);
app.use("/", contactRoutes);
app.use("/", aboutusRoutes);
app.use("/", footerwidgetRoutes);

// app.use("/", pagi);
app.use("/", pagination);
// app.use("/", cRoutes);
// app.use("/view-all/2", cRoutes);
app.use("/", AdminRouter);
app.use("/", resize);
app.use("/", testnav);

// app.get("/ramm", function (req, res) {
//   req.flash("mess", "course item updated successfully");
//   return res.redirect("/sikandar");
// });

// app.get("/sikandar", function (req, res) {
//   // res.send(req.flash("mess"));
//   // matcherror
//   res.render("common/matcherror.html", {
//     msg: req.flash("mess"),
//   });
// });

app.get("/option-show", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection("tb_option").findOne(function (err, result1) {
      res.status(200).json(result1);
    });
  });
});

app.get("/social-show", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection("socials")
      .find()
      .toArray(function (err, result) {
        res.status(200).json(result);
      });
  });
});
