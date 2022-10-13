var express = require("express");
var bodyparser = require("body-parser");
var fs = require("fs");
// var path = require("path");
var multer = require("multer");
var sharp = require("sharp");
var router = express();
router.use("/image", express.static(__dirname + "/images"));

// var upload = multer({ dest: "./images" });

var imagec = "";

// router.use("/uploads", express.static(__dirname + "/uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = require("path");
    imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, imagec);
  },
});

var upload = multer({ storage: storage });

router.use(bodyparser.urlencoded({ extended: true }));

router.get("/hek", function (req, res, next) {
  // imageinput.html
  res.render("imagecheck/imageinput.html");
});

router.post("/upload", upload.single("avatar"), (req, res) => {
  var path = require("path");
  // const file = req.file;
  const file = req.file;
  var imagepath = "";
  if (file && !file.length) {
    imagepath = file.filename;
  }

  // console.log("filenakk", file);

  //   fs.rename(req.file.path, "/course-single-image.jpg", (err) => {
  //     console.log(err);
  //   });
  // console.log("good", __dirname + file.path);

  // setTimeout(function () {
  sharp("./images/" + file.filename)
    .resize(200, 200)
    .toFile(__dirname + "/thumbnail_" + file.filename);

  sharp("./images/" + file.filename)
    .resize(640, 480)
    .toFile(__dirname + "/middile_" + file.filename);
  // }, 5000);

  // sharp(__dirname + "/images" + file.originalname)
  //   .resize(200, 200)
  //   .toFile(__dirname + "/hello.jpg");
  // sharp(__dirname + "/0011ff.png")
  //   .resize(640, 480)
  //   .jpeg({ quality: 80 })
  //   .toFile(__dirname + "/avatar_preview.jpg");
  return res.json("File Uploaded Successfully!");
});

module.exports = router;
