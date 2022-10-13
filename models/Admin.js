const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.fieldname === "uplactor" ||
      file.fieldname === "uplactress" ||
      file.fieldname === "director" ||
      file.fieldname === "uplSideCharacter"
    ) {
      // if uploading cast photo
      cb(null, "public/cast_images");
    } else if (file.fieldname === "uplTrailer") {
      // else uploading trailer
      cb(null, "public/trailers");
    } else if (file.fieldname === "uplMovie") {
      // else uploading movie
      cb(null, "public/movies");
    } else if (file.fieldname === "uplposter") {
      // else uploading poster
      cb(null, "public/posters");
    }
    cb(null, "public/posters");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "uplactor" ||
    file.fieldname === "uplactress" ||
    file.fieldname === "director" ||
    file.fieldname === "uplSideCharacter" ||
    file.fieldname === "uplposter"
  ) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("You can upload only image files!"));
    } else {
      cb(null, true);
    }
  }
  if (file.fieldname === "uplMovie" || file.fieldname === "uplTrailer") {
    if (!file.originalname.match(/\.(mp4|mp3)$/)) {
      return cb(new Error("You can upload only video files!"));
    } else {
      cb(null, true);
    }
  }
};
exports.upload = multer({ storage: storage, fileFilter: fileFilter });
