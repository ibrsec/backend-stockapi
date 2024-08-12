"use strict";

const { mongoose } = require("../configs/dbConnection");
const uniqueValidator = require("mongoose-unique-validator");



const FirmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 100,
      set:(name) => name[0].toUpperCase()+name.slice(1),
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      maxLength: 11,
      match: [/^[0-9]+$/, 'Phone field must contain just numbers!'],
    },
    address: {
      type: String,
      trim: true,
      required: true,
      maxLength: 200,
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
    collection: "firms",
    timestamps: true,
  }
);

FirmSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Firm = mongoose.model("Firm", FirmSchema);
