"use strict";

const { User } = require("../models/userModel");

module.exports = async () => {
  User.deleteMany()
    .then(() => {
      console.log("users are cleaned!");
    })
    .catch((err) => {
      console.log("users couldn't be cleaned!", err);
    });

    try{

        await User.create({
            username: "normal1",
            email: "normal1@normal1.com",
            password:
            "Aa*12345",
            is_active: true,
            is_admin: false,
            is_staff: false,
        });
        await User.create({
            username: "normal2",
            email: "normal2@normal2.com",
            password:
            "Aa*12345",
            is_active: true,
            is_admin: false,
            is_staff: false,
        });



        await User.create({
            username: "staff1",
            email: "staff1@staff1.com",
            password:
            "Aa*12345",
            is_active: true,
            is_admin: false,
            is_staff: true,
        });
        await User.create({
            username: "staff2",
            email: "staff2@staff2.com",
            password:
            "Aa*12345",
            is_active: true,
            is_admin: false,
            is_staff: true,
        });


        await User.create({
            username: "passive",
            email: "passive@passive.com",
            password:
            "Aa*12345",
            is_active: false,
            is_admin: false,
            is_staff: false,
        });

        console.log('Users are added succeessfully!');
    }catch(err){
        console.log('users couldn\'t be added!',err);
    }






};
