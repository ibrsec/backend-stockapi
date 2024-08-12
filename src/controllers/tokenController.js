"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports.token = {
  list: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const tokens = await res.getModelList(Token,{},"user_id");
    res.status(200).json({
      error: false,
      message: "Tokens are listed!",
      details: await res.getModelListDetails(Token),
      result: tokens,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.ignore = true
           

        */

    const { user_id, token } = req.body;

    if (!user_id || !token) {
      throw new CustomError("user_id, token fields are required!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const newToken = await Token.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new token is created!",
      result: newToken,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const token = await Token.findOne({ _id: req.params.id }).populate('user_id');

    if (!token) {
      throw new CustomError("Token not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Token is found!",
      result: token,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { token, user_id } = req.body;

    if (!token || !user_id) {
      throw new CustomError("token, user_id fields are required!", 400);
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const { modifiedCount } = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );

    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { token, user_id } = req.body;

    if (!(token || user_id)) {
      throw new CustomError(
        "At least one field of token, user_id fields is required!",
        400
      );
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const { modifiedCount } = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );

    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is partially updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const token = await Token.findOne({ _id: req.params.id });

    if (!token) {
      throw new CustomError("Token not found!", 404);
    }

    const { deletedCount } = await Token.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
