const mongoose = require("mongoose");
var validator = require("validator");

var passSchema = new mongoose.Schema({
  password_category: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  project_name: { type: String, required: true },
  password_detail: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
});

var passModel = mongoose.model("password_details", passSchema);
module.exports = passModel;
