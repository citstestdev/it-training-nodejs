const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CastSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  simage: {
    type: String,
  },
});
const Cast = mongoose.model("Cast", CastSchema);
module.exports = Cast;
