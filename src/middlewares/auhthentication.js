"use strict";

const jwt = require("jsonwebtoken");
const { Token } = require("../models/tokenModel");

module.exports = async (req, res, next) => {
  req.user = null;
  const authHeader = req.headers?.authorization || null;

  if (authHeader) {
    if (authHeader.split(" ")[0] === "Token") {
      const tokenKey = authHeader.split(" ")[1];
      if (tokenKey) {
        const tokenData = await Token.findOne({ token: tokenKey }).populate(
          "user_id"
        );
        console.log('tokenData', tokenData)
        if (tokenData) {
          req.user = {
            _id: tokenData?.user_id?._id,
            username: tokenData?.user_id?.username,
            is_admin: tokenData?.user_id?.is_admin,
            is_active: tokenData?.user_id?.is_active,
            is_staff: tokenData?.user_id?.is_staff,
          };
        }
      }
    } else if (authHeader.split(" ")[0] === "Bearer") {
      const tokenKey = authHeader.split(" ")[1];
      if (tokenKey) {
        jwt.verify(tokenKey, process.env.ACCESS_KEY, (err, decoded) => {
          if (!err) {
            console.log(decoded);
            req.user = {
              _id: decoded?._id,
              username: decoded?.username,
              is_admin: decoded?.is_admin,
              is_active: decoded?.is_active,
              is_staff: decoded?.is_staff,
            };
          }
        });
      }
    }
  }

  next();
};
