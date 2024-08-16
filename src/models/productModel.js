"use strict";

const { mongoose } = require("../configs/dbConnection");
const uniqueValidator = require("mongoose-unique-validator");



const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 100,
      set:(name) => name[0].toUpperCase()+name.slice(1),
    },
    quantity: {
      type: Number, 
      default: 0,   
    },
    categoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,  
    },
    brandId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,  
    },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

ProductSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Product = mongoose.model("Product", ProductSchema);
