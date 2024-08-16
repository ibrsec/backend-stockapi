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

    const tokens = await res.getModelList(Token,{},"userId");
    res.status(200).json({
      error: false,
      message: "Tokens are listed!",
      details: await res.getModelListDetails(Token),
      data: tokens,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.ignore = true
           

        */

    const { userId, token } = req.body;

    if (!userId || !token) {
      throw new CustomError("userId, token fields are required!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const newToken = await Token.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new token is created!",
      data: newToken,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const token = await Token.findOne({ _id: req.params.id }).populate('userId');

    if (!token) {
      throw new CustomError("Token not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Token is found!",
      data: token,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { token, userId } = req.body;

    if (!token || !userId) {
      throw new CustomError("token, userId fields are required!", 400);
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const data = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );

    if (data?.modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is updated!",
      data,
      new: await Token.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { token, userId } = req.body;

    if (!(token || userId)) {
      throw new CustomError(
        "At least one field of token, userId fields is required!",
        400
      );
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    const data = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );

    if (data?.modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be updated!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is partially updated!",
      data,
      new: await Token.findOne({ _id: req.params.id }),
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
