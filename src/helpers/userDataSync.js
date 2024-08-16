"use strict";

const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports = async () => {
  User.deleteMany()
    .then(() => {
      console.log("users are cleaned!");
    })
    .catch((err) => {
      console.log("users couldn't be cleaned!", err);
    });
  Token.deleteMany()
    .then(() => {
      console.log("tokens are cleaned!");
    })
    .catch((err) => {
      console.log("tokens couldn't be cleaned!", err);
    });

    try{

        await User.create({
            username: "normal1",
            email: "normal1@normal1.com",
            password:
            "Aa*12345",
            isActive: true,
            isAdmin: false,
            isStaff: false,
        });
        await User.create({
            username: "normal2",
            email: "normal2@normal2.com",
            password:
            "Aa*12345",
            isActive: true,
            isAdmin: false,
            isStaff: false,
        });



        await User.create({
            username: "staff1",
            email: "staff1@staff1.com",
            password:
            "Aa*12345",
            isActive: true,
            isAdmin: false,
            isStaff: true,
        });
        await User.create({
            username: "staff2",
            email: "staff2@staff2.com",
            password:
            "Aa*12345",
            isActive: true,
            isAdmin: false,
            isStaff: true,
        });


        await User.create({
            username: "passive",
            email: "passive@passive.com",
            password:
            "Aa*12345",
            isActive: false,
            isAdmin: false,
            isStaff: false,
        });

        console.log('Users are added succeessfully!');
    }catch(err){
        console.log('users couldn\'t be added!',err);
    }






};
