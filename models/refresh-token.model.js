const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "RefreshToken",
  new Schema({
    refreshToken: {
      type: String,
      trim: true,
      unique: true,
      required: true
    },
    created: {
      type: Date,
      default: Date.now
    }
  })
);
