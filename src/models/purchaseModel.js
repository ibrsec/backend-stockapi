"use strict";

const { mongoose } = require("../configs/dbConnection");
const uniqueValidator = require("mongoose-unique-validator");



const PurchaseSchema = new mongoose.Schema(
  {
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,  
    },
    firm_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true,  
    },
    brand_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,  
    },
    product_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,  
    },
    quantity:{
      type:Number,
      required:true,
      
    }
  },
  {
    collection: "purchases",
    timestamps: true,
  }
);

PurchaseSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Purchase = mongoose.model("Purchase", PurchaseSchema);
