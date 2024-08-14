"use strict";

const { User } = require("../models/userModel");

module.exports = async () => {
  const adminUser = await User.findOne({ is_admin: true });
  if (!adminUser) {
    await User.create({
      username: "adminuser",
      email: "adminuser@adminuser.com",
      password: "Aa*12345",
      first_name: "adminfirst",
      last_name: "adminlast",
      is_active: true,
      is_admin: true,
      is_staff: false,
    });
    console.log("admin user is added!");
  } else {
    console.log("admin user is already exist!");
  }
  console.log("adminUser= ", adminUser);
};
