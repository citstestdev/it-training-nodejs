const mongoose = require("mongoose");
var validator = require("validator");

const menuSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slugname: {
    type: String,
    required: true,
  },
  menuurl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  indexnumber: {
    type: Number,
    index: {
      unique: true,
    },
  },
  menutype: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const menusdata = mongoose.model("menus", menuSchema);

module.exports = menusdata;
