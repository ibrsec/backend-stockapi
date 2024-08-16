"use strict";

const { mongoose } = require("../configs/dbConnection");
const emailValidtion = require("../helpers/emailValidtion");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const passwordValidation = require("../helpers/passwordValidation");
const uniqueValidator = require("mongoose-unique-validator");



const invalidPasswordMessage =
  "Invalid password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]";



const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index:true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index:true,
    validate: [
      (email) => emailValidtion(email),
      "Invalid email type, type: __@__.__",
    ],
  },
  password: {
    type: String,
    trim: true,
    required: true,
    set: (password) => {
      if (passwordValidation(password)) {
        
        return passwordEncryptor(password);
      } else {
        return invalidPasswordMessage;
      }
    },
    validate: [
      (password) => {
        if (password === invalidPasswordMessage) {
          
          return false;
        } else {
          return true;
        }
      },
      invalidPasswordMessage,
    ],
  },
  firstName:{
    type:String,
    trim:true,
    required: true,
    
  },
  lastName:{
    type:String,
    trim:true,
    required: true,

  },
  isActive:{
    type: Boolean,
    default:true,

  },
  isAdmin:{
    type: Boolean,
    default:false,

  },
  isStaff:{
    type: Boolean,
    default:false,

  },
},{
    collection:'users',timestamps:true
});

UserSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist!",
});


module.exports.User = mongoose.model('User',UserSchema);