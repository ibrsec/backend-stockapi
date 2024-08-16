"use strict";

const jwt = require("jsonwebtoken");
const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports.user = {
  list: async function (req, res) {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                List all users!</br></br>
                <b>Permission= Loginned user</b></br> 
                - Normal users can't list staff or admin users</br>
                - Staff users can't list admin users</br></br>
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

    //restrict listing user to non admin users = they wont see the admins

    let customFilters = { isAdmin: false, isStaff: false };
    if (req.user?.isAdmin) {
      customFilters = {};
    } else if (req?.user?.isStaff) {
      customFilters = { isAdmin: false };
    }

    const users = await res.getModelList(User, customFilters);
    res.status(200).json({
      error: false,
      message: "Users are listed!",
      details: await res.getModelListDetails(User, customFilters),
      data: users,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create new User"
            #swagger.description = `
                create a new user!</br></br>
                <b>Permission= No Permission</b></br> 
                - Admin or staff or in-active users can be create.d just by admin users</br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - username, email, password, firstName, lastName</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $username : 'testuser',
                    $email : 'testuser@email.com',
                    $password : 'Password1*',
                    $firstName : 'firstname',
                    $lastName : 'lastname',
                    isActive : true,
                    isAdmin : false,
                    isStaff : false,

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new user is created!!",
                token:"tokenkey",
                bearer:{
                  accessToken:"accestoken key",
                  refreshToken:"refreshtoken key",
                },
                data:{$ref: '#/definitions/User'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - username,email,password, firstName, lastName fields are required!`
            }



        */

    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      throw new CustomError(
        "username, email, password, firstName, lastName fields are required!",
        400
      );
    }

    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = false;
      req.body.isStaff = false;
      req.body.isActive = true;
    }

    const newUser = await User.create(req.body);

    /* AUTO LOGIN */
    // SimpleToken:
    const tokenData = await Token.create({
      userId: newUser._id,
      token: passwordEncryptor(newUser._id + Date.now()),
    });
    // JWT:
    const accessToken = jwt.sign(newUser.toJSON(), process.env.ACCESS_KEY, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(
      { _id: newUser._id, password: newUser.password },
      process.env.REFRESH_KEY,
      { expiresIn: "3d" }
    );
    /* AUTO LOGIN */

    res.status(201).json({
      error: false,
      message: "A new user is created!",
      token: tokenData.token,
      bearer: { accessToken, refreshToken },
      data: newUser,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get a user"
            #swagger.description = `
                Get a user by id!!</br></br>
                <b>Permission= Loginned user</b></br> 
                - Admin can list all users!</br>
                - Staff user can list all users except admin users!</br>
                - Normal user can list all users except admin or staff users!</br></br> 
            
            #swagger.responses[200] = {
            description: 'Successfully found!',
            schema: { 
                error: false,
                message: "User is found!",
                data:{$ref: '#/definitions/User'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid id type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - User not found!`
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    let customFilters = { isAdmin: false, isStaff: false };
    if (req.user?.isAdmin) {
      customFilters = {};
    } else if (req.user?.isStaff) {
      customFilters = { isAdmin: false };
    }

    //ath bitince sil ->
    // customFilters = {};

    const user = await User.findOne({ _id: req.params.id, ...customFilters });

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "User is found!",
      data: user,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Update a User"
            #swagger.description = `
                Update a User by id!</br></br>
                <b>Permission= Normal user</b></br> 
                - Admin users can be update.d just by admin users</br> 
                - Other users can update theirselves</br>
                - Admin, staff or active modifications are accessible for just the admin users!</br> </br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - username,email,password</br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $username : 'testuser',
                    $email : 'testuser@email.com',
                    $password : 'Password1*',
                    $firstName : 'firstname',
                    $lastName : 'lastname',
                    isActive : true,
                    isAdmin : false,
                    isStaff : false,

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message: "User is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- username, email, password, firstName, lastName fields are required!
                    </br>- non-admin users can't modify other users!
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - User not found!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      throw new CustomError(
        "username,email,password, firstName, lastName fields are required!",
        400
      );
    }

    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    //admin restrictions

    // - Admin users can be updated just by admin users
    // - Staff users can be updated by admin or staff users
    // - Normal users can't update other users

    /*--------open after => auth---------*
    if (req.user?.isAdmin) {
      //admin user can modify all users!

    } else if (req.user?.isStaff) {
      //staff user is request own user modification
      if (user?.isAdmin) {
        //if staff try to modify admin
        throw new CustomError("Staff users can't modify the admin users!", 400);
      } else if (user?.isStaff) {
        //id staff try to modify staff
        if (req.user?.userId !== req.params.id) {
          //staff can just modify himself, other staff users are forbidden to modify for him!
          throw new CustomError(
            "Staff users can't modify other staff users except himself!",
            400
          );
        }
      }



    } else {
      //normal users can just modify himself!
      if (req.user?.userId !== req.params.id) {
        throw new CustomError("Normal users can't modify other users!", 400);
      }
    }

    /*-----------------*/

    if (!req?.user?.isAdmin) {
      if (req.user?._id != req.params.id) {
        throw new CustomError("non-admin users can't modify other users!", 400);
      }
    }

    //admin staff or active modifications are accessible for just the admin users!
    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = user?.isAdmin;
      req.body.isStaff = user?.isStaff;
      req.body.isActive = user?.isActive;
    }

    const data = await User.updateOne(
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
      message: "User is updated!",
      data,
      new: await User.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Partial Update"
            #swagger.description = `
                Partial Update a User by id!</br></br>
                <b>Permission= Normal user</b></br> 
                - Admin users can be update.d just by admin users</br>
                - Other users can update theirselves</br>
                - Admin, staff or active modifications are accessible for just the admin users!</br> </br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - Aat least one of the username, email, password, firstName, lastName, isActive, isAdmin, isStaff fields is required!</br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:'One field is enough!',
                required:true,
                schema:{
                    username : 'testuser',
                    email : 'testuser@email.com',
                    password : 'Password1*',
                    firstName : 'firstname',
                    lastName : 'lastname',
                    isActive : true,
                    isAdmin : false,
                    isStaff : false,

                }
            }
            #swagger.responses[202] = {
            description: 'Successfully partiqally updated!',
            schema: { 
                error: false,
                message: "User is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- At least one field of username, email, password, firstName, lastName,isActive,isAdmin,isStaff fields is required!
                    </br>- non-admin users can't modify other users!
                    
                    `
            }
            #swagger.responses[404] = {
                description:`Not found - User not found!`
            }
            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      isActive,
      isAdmin,
      isStaff,
    } = req.body;

    if (
      !(
        username ||
        email ||
        password ||
        firstName ||
        lastName ||
        isActive ||
        isAdmin ||
        isStaff
      )
    ) {
      throw new CustomError(
        "At least one field of username, email, password, firstName, lastName,isActive,isAdmin,isStaff fields is required!",
        400
      );
    }

    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    //admin restrictions

    // - Admin users can be updated just by admin users
    // - Staff users can be updated by admin or staff users
    // - Normal users can't update other users

    /*--------open after => auth---------*
    if (req.user?.isAdmin) {
      //admin user can modify all users!

    } else if (req.user?.isStaff) {
      //staff user is request owner
      if (user?.isAdmin) {
        //if staff try to modify admin
        throw new CustomError("Staff users can't modify the admin users!", 400);
      } else if (user?.isStaff) {
        //id staff try to modify staff
        if (req.user?.userId !== req.params.id) {
          //staff can just modify himself, other staff users are forbidden to modify for him!
          throw new CustomError(
            "Staff users can't modify other staff users except himself!",
            400
          );
        }
      }



    } else {
      //normal users can just modify himself!
      if (req.user?.userId !== req.params.id) {
        throw new CustomError("Normal users can't modify other users!", 400);
      }
    }



    /*-----------------*/
    if (!req?.user?.isAdmin) {
      if (req.user?._id != req.params.id) {
        throw new CustomError("non-admin users can't modify other users!", 400);
      }
    }

    //admin staff or active modifications are accessible for just the admin users!
    if (!req?.user?.isAdmin) {
      //if user is not a admin user!
      req.body.isAdmin = user?.isAdmin;
      req.body.isStaff = user?.isStaff;
      req.body.isActive = user?.isActive;
    }

    const { modifiedCount } = await User.updateOne(
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
      message: "User is pqrtially updated!",
      result: await User.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete a user"
            #swagger.description = `
                Delete a user by id!!</br></br>
                <b>Permission= Admin user</b></br> 
                - Admin can delete all users!</br>
                - Other users can't delete any user!</br> 
            
            #swagger.responses[204] = {
            description: 'Successfully deleted!'

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid id type(ObjectId)!`
            }
            #swagger.responses[404] = {
            description:`Not found - User not found!`
            }

            #swagger.responses[500] = {
                description:`Something went wrong! - asked record is found, but it couldn't be updated!`
            }

        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    const { deletedCount } = await User.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
