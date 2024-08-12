"use strict";

const { mongoose } = require("../configs/dbConnection");
const uniqueValidator = require("mongoose-unique-validator");



const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 100,
      set:(name) => name[0].toUpperCase()+name.slice(1),
    },
  },
  {
    collection: "categories",
    timestamps: true,
  }
);

CategorySchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Category = mongoose.model("Category", CategorySchema);
