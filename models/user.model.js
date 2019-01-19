const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "User",
  new Schema({
    name: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      unique: false,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: false
    },
    created: {
      type: Date,
      default: Date.now
    }
  })
);
