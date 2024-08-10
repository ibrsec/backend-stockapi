"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports.token = {
  list: async(req, res) =>{
    /*
            #swagger.ignore = true
            #swagger.tags = ["Tokens"]
            #swagger.summary = "List Tokens"
            #swagger.description = `
                List all tokens!</br></br>
                <b>Permission= Loginned token</b></br> 
                - Normal tokens can't list staff or admin tokens</br>
                - Staff tokens can't list admin tokens</br></br>
                Token endpoint is hidden </br></br>
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `



        */

    const tokens = await res.getModelList(Token);
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
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Create new Token"
            #swagger.description = `
                List all tokens!</br></br>
                <b>Permission= No Permission</b></br> 
                - Admin or staff or in-active tokens can be create.d just by admin tokens</br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - tokenname,email,password</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $tokenname : 'testtoken',
                    $email : 'testtoken@email.com',
                    $password : 'Password1*',
                    first_name : 'firstname',
                    last_name : 'lastname',
                    is_active : true,
                    is_admin : false,
                    is_staff : false,

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new token is created!!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - tokenname,email,password fields are required!`
            }



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
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Get a token"
            #swagger.description = `
                Get a token by id!!</br></br>
                <b>Permission= Loginned token</b></br> 
                - Admin can list all tokens!</br>
                - Staff token can list all tokens except admin tokens!</br>
                - Normal token can list all tokens except admin or staff tokens!</br></br> 
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "Token is found!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid id type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Token not found!`
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

 

    const token = await Token.findOne({ _id: req.params.id });

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
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Update a Token"
            #swagger.description = `
                Update a Token by id!</br></br>
                <b>Permission= Normal token</b></br> 
                - Admin tokens can be update.d just by admin tokens</br>
                - Staff tokens can be updated by admin or staff tokens</br>
                - Normal tokens can't update other tokens</br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - tokenname,email,password</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $tokenname : 'testtoken',
                    $email : 'testtoken@email.com',
                    $password : 'Password1*',
                    first_name : 'firstname',
                    last_name : 'lastname',
                    is_active : true,
                    is_admin : false,
                    is_staff : false,

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "Token is updated!!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- tokenname,email,password fields are required!
                    </br>- Staff tokens can't modify the admin tokens!
                    </br>- Staff tokens can\'t modify other staff tokens except himself!
                    </br>- Normal tokens can\'t modify other tokens!
                    
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - Token not found!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { token, user_id } = req.body;

    if (!token || !user_id) {
      throw new CustomError(
        "token, user_id fields are required!",
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
      message: "Token is updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.ignore = true
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Partial Update"
            #swagger.description = `
                Partial Update a Token by id!</br></br>
                <b>Permission= Normal token</b></br> 
                - Admin tokens can be update.d just by admin tokens</br>
                - Staff tokens can be updated by admin or staff tokens</br>
                - Normal tokens can't update other tokens</br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - Aat least one of the tokenname,email,password,first_name,last_name,is_active,is_admin,is_staff fields is required!</br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:'One field is enough!',
                required:true,
                schema:{
                    tokenname : 'testtoken',
                    email : 'testtoken@email.com',
                    password : 'Password1*',
                    first_name : 'firstname',
                    last_name : 'lastname',
                    is_active : true,
                    is_admin : false,
                    is_staff : false,

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully partiqally updated!',
            schema: { 
                error: false,
                message: "Token is partially updated!!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- tokenname,email,password fields are required!
                    </br>- Staff tokens can't modify the admin tokens!
                    </br>- Staff tokens can\'t modify other staff tokens except himself!
                    </br>- Normal tokens can\'t modify other tokens!
                    
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - Token not found!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



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
      message: "Token is pqrtially updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.ignore = true
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Delete a token"
            #swagger.description = `
                Delete a token by id!!</br></br>
                <b>Permission= Admin token</b></br> 
                - Admin can delete all tokens!</br>
                - Other tokens can't delete any token!</br> 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid id type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - Token not found!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

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
