"use strict";

const { mongoose } = require("../configs/dbConnection");
// const uniqueValidator = require("mongoose-unique-validator");



const PurchaseSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,  
    },
    firmId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true,  
    },
    brandId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,  
    },
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,  
    },
    quantity:{
      type:Number,
      required:true,
      
    },
    price:{
      type:Number,
      required:true,
      
    },
    amount:{
      type:Number,
      set:function(){
        return this.price * this.quantity;
      },
      default:function(){
        return this.price * this.quantity;
      },
      transform:function(){
        return this.price * this.quantity;
      },
      
    },
  },
  {
    collection: "purchases",
    timestamps: true,
  }
);

// PurchaseSchema.plugin(uniqueValidator, {
//   message: "This {PATH} is exist!",
// });

module.exports.Purchase = mongoose.model("Purchase", PurchaseSchema);
