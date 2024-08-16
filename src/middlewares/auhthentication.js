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
          "userId"
        );
        console.log('tokenData', tokenData)
        if (tokenData) {
          req.user = {
            _id: tokenData?.userId?._id,
            username: tokenData?.userId?.username,
            isAdmin: tokenData?.userId?.isAdmin,
            isActive: tokenData?.userId?.isActive,
            isStaff: tokenData?.userId?.isStaff,
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
              isAdmin: decoded?.isAdmin,
              isActive: decoded?.isActive,
              isStaff: decoded?.isStaff,
            };
          }
        });
      }
    }
  }

  next();
};
