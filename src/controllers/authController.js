"use strict";

const jwt = require("jsonwebtoken");
const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports.auth = {
  login: async (req, res) => {
    /* 
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = `
                Login with username/email and password!</br></br>
                <b>Permission= No Permission</b></br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - username or email,password</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $username : 'username',
                    $email : 'email@email.com',
                    $password : 'Password1*'

                }
            }
            #swagger.responses[200] = {
            description: 'Successfully Logined!',
            schema: { 
                error: false,
                message: "Login is OK!",
                    token: 'tokenkey',
                    bearer:{
                        accessToken: 'access token',
                        refreshToken: 'refresh token'
                    },
                user:{
                  "_id": "66362c828c9af95390f5aae5",
                  "username": "testba",
                  "password": "f1dffdee8d0642d170e697331929a7250aedca4ad508f4d1f9986dbdb888c5fc",
                  "email": "testba@test.com",
                  "firstName": "testba",
                  "lastName": "batest",
                  "isActive": true,
                  "isStaff": false,
                  "isAdmin": false,
                  "createdAt": "2024-05-04T12:39:30.473Z",
                  "updatedAt": "2024-05-04T12:39:30.473Z",
                }
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - email or username and password fields are required!`
            }
            #swagger.responses[401] = {
            description:`Unauthorized: 
                    </br>- User not found!
                    </br>- Your account is not active - please contact with support!
                    </br>- Invalid password!
                    `
            }



        */

    const { username, email, password } = req.body;
    if (!(username || email) || !password) {
      throw new CustomError(
        "email or username and password fields are required!",
        400
      );
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      throw new CustomError("Unauthorized - User not found!", 401);
    }
    if (!user?.isActive) {
      throw new CustomError(
        "Unauthorized - Your account is not active - please contact with support!",
        401
      );
    }

    if (user?.password !== passwordEncryptor(password)) {
      throw new CustomError("Unauthorized - Invalid password!", 401);
    }

    //token auth
    let tokenData = await Token.findOne({ userId: user?._id });
    if (!tokenData) {
      tokenData = await Token.create({
        userId: user?._id,
        token: passwordEncryptor(user?._id + Date.now()),
      });
    }

    //jwt token
    const accessData = {
      _id: user?._id,
      username: user?.username,
      isAdmin: user?.isAdmin,
      isActive: user?.isActive,
      isStaff: user?.isStaff,
    };
    const refreshData = {
      username: user?.username,
      password: user?.password,
    };

    const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(refreshData, process.env.REFRESH_KEY, {
      expiresIn: "1d",
    });

    res.status(200).json({
      error: false,
      message: "Login is OK!",
      token: tokenData?.token,
      bearer: {
        accessToken,
        refreshToken,
      },
      user,
    });
  },
  refresh: async (req, res) => {
    /* 
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Refresh token"
            #swagger.description = `
                Refresh the access token with refresh token!</br></br> 
                <b>Permission= No Permission</b></br></br>
                - Required fields: - bearer. refresh Token</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    "bearer":{
                        "refresh Token": "...refresh token"
                    }

                }
            }
            #swagger.responses[200] = {
            description: 'Successfully refreshed!',
            schema: { 
                error: false,
                message: "Access token is refreshed!!",
                result:{ 
                    bearer:{ 
                        'accessToken': 'access token'
                    }
                } 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - bearer.refreshToken is a required field!`
            }
            #swagger.responses[401] = {
            description:`Unauthorized: 
                    </br>- Unauhtorized - Invalid signature - invalid token or token is expired!!
                    </br>- Unauhtorized - Your account is not active - please contact with support!!!
                    </br>- User not found!
                    </br>- Invalid password!
                    `
            }



        */
    const refreshToken = req?.body?.bearer?.refreshToken;
    if (!refreshToken) {
      throw new CustomError("bearer.refreshToken is a required field!", 400);
    }

    let decodedData = false;
    jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, decoded) => {
      if (err) {
        throw new CustomError(
          "Unauhtorized - Invalid signature - invalid token or token is expired!!",
          401
        );
      }
      decodedData = decoded;
    });

    console.log(decodedData);

    if (!decodedData) {
      throw new CustomError(
        "Unauhtorized - Invalid signature - invalid token or token is expired!",
        401
      );
    }

    const user = await User.findOne({ username: decodedData?.username });
    if (!user) {
      throw new CustomError("Unauhtorized - User not found!", 401);
    }
    if (!user?.isActive) {
      throw new CustomError(
        "Unauthorized - Your account is not active - please contact with support!",
        401
      );
    }

    if (user?.password !== decodedData?.password) {
      throw new CustomError("Unauhtorized - Invalid password!", 401);
    }

    const accessData = {
      _id: user?._id,
      username: user?.username,
      isAdmin: user?.isAdmin,
      isActive: user?.isActive,
      isStaff: user?.isStaff,
    };

    const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, {
      expiresIn: "30m",
    });

    res.status(200).json({
      error: false,
      message: "Access token is refreshed!!",
      bearer: {
        accessToken,
      },
    });
  },
  logout: async (req, res) => {
    /* 
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Logout"
            #swagger.description = `
                Logout with with token or with out token!</br></br>
                <b>Permission= No Permission</b></br></br>
                '
            #swagger.responses[200] = {
            description: 'Successfully Logged out!',
            schema: { 
                error: false,
                message: "Logout is OK!",
                result:{
                    deletedToken: 1
                } 
            }

        }  



        */
    const result = await Token.deleteOne({ userId: req?.user?._id });

    res.json({
      error: false,
      message: "Logout is OK!",
      result
    });
  },
};
