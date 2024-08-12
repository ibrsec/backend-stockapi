"use strict";

const { mongoose } = require("../configs/dbConnection");
const uniqueValidator = require("mongoose-unique-validator");



const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 100,
      set:(name) => name[0].toUpperCase()+name.slice(1),
    },
    image: {
      type: String,
      trim: true,
      requried: true,
      maxLength: 1000,
      match: [/^(http:\/\/|https:\/\/)/, 'Image field must start with http:// or https:// !'],
    },
  },
  {
    collection: "brands",
    timestamps: true,
  }
);

BrandSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Brand = mongoose.model("Brand", BrandSchema);
