const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../Controller/Admin");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "uplactor" || file.fieldname === "uplactress")
      cb(null, "public/posters");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get("/postFile", (req, res) => {
  res.render("adminUpload.html");
});
var tempupload = upload.fields([
  { name: "uplactor", maxCount: 1 },
  { name: "uplactress", maxCount: 1 },
]);
router.post("/postFile", tempupload, controller.uploadDB);

module.exports = router;
