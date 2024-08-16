"use strict";

const { User } = require("../models/userModel");

module.exports = async () => {
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    await User.create({
      username: "adminuser",
      email: "adminuser@adminuser.com",
      password: "Aa*12345",
      firstName: "adminfirst",
      lastName: "adminlast",
      isActive: true,
      isAdmin: true,
      isStaff: false,
    });
    console.log("admin user is added!");
  } else {
    console.log("admin user is already exist!");
  }
  console.log("adminUser= ", adminUser);
};
