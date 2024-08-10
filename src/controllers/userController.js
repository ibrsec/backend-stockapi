"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
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

    const customFilters = { is_admin: false, is_staff: false };
    if (req.user?.is_admin) {
      customFilters = {};
    } else if (req?.user?.is_staff) {
      customFilters = { is_admin: false, is_staff: true };
    }

    const users = await res.getModelList(User /* ,customfilters */);
    res.status(200).json({
      error: false,
      message: "Users are listed!",
      details: await res.getModelListDetails(User /* ,customfilters */),
      result: users,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create new User"
            #swagger.description = `
                List all users!</br></br>
                <b>Permission= No Permission</b></br> 
                - Admin or staff or in-active users can be create.d just by admin users</br></br>
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
                message: "A new user is created!!",
                result:{$ref: '#/definitions/User'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - username,email,password fields are required!`
            }



        */

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new CustomError(
        "username,email,password fields are required!",
        400
      );
    }

    if (!req?.user?.is_admin) {
      //if user is not a admin user!
      req.body.is_admin = false;
      req.body.is_staff = false;
      req.body.is_active = true;
    }

    const newUser = await User.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new user is created!",
      result: newUser,
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
                result:{$ref: '#/definitions/User'} 
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

    let customFilters = { is_admin: false, is_staff: false };
    if (req.user?.is_admin) {
      customFilters = {};
    } else if (req.user?.is_staff) {
      customFilters = { is_admin: false };
    }

    //ath bitince sil ->
    customFilters = {};

    const user = await User.findOne({ _id: req.params.id, ...customFilters });

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "User is found!",
      result: user,
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
                - Staff users can be updated by admin or staff users</br>
                - Normal users can't update other users</br></br>
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
                message: "User is updated!!",
                result:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- username,email,password fields are required!
                    </br>- Staff users can't modify the admin users!
                    </br>- Staff users can\'t modify other staff users except himself!
                    </br>- Normal users can\'t modify other users!
                    
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

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new CustomError(
        "username,email,password fields are required!",
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
    if (req.user?.is_admin) {
      //admin user can modify all users!

    } else if (req.user?.is_staff) {
      //staff user is request owner
      if (user?.is_admin) {
        //if staff try to modify admin
        throw new CustomError("Staff users can't modify the admin users!", 400);
      } else if (user?.is_staff) {
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



    //admin staff or active modifications are accessible for just the admin users!
    if (!req?.user?.is_admin) {
      //if user is not a admin user!
      req.body.is_admin = user?.is_admin;
      req.body.is_staff = user?.is_staff;
      req.body.is_active = user?.is_active;
    }
    /*-----------------*/

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
      message: "User is updated!",
      result: await User.findOne({ _id: req.params.id }),
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
                - Staff users can be updated by admin or staff users</br>
                - Normal users can't update other users</br></br>
                - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]</br>
                - Email type Rules- --@--.--</br>
                - Required fields: - Aat least one of the username,email,password,first_name,last_name,is_active,is_admin,is_staff fields is required!</br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:'One field is enough!',
                required:true,
                schema:{
                    username : 'testuser',
                    email : 'testuser@email.com',
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
                message: "User is partially updated!!",
                result:{$ref: '#/definitions/User'} 
            }

        }  

            #swagger.responses[400] = {
                description:`Bad request 
                    </br>- Invalid id type(ObjectId)!
                    </br>- username,email,password fields are required!
                    </br>- Staff users can't modify the admin users!
                    </br>- Staff users can\'t modify other staff users except himself!
                    </br>- Normal users can\'t modify other users!
                    
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

    const { username, email, password,first_name,last_name,is_active,is_admin,is_staff } = req.body;

    if (!(username || email || password || first_name || last_name || is_active || is_admin || is_staff)) {
      throw new CustomError(
        "At least one field of username, email, password,first_name,last_name,is_active,is_admin,is_staff fields is required!",
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
    if (req.user?.is_admin) {
      //admin user can modify all users!

    } else if (req.user?.is_staff) {
      //staff user is request owner
      if (user?.is_admin) {
        //if staff try to modify admin
        throw new CustomError("Staff users can't modify the admin users!", 400);
      } else if (user?.is_staff) {
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



    //admin staff or active modifications are accessible for just the admin users!
    if (!req?.user?.is_admin) {
      //if user is not a admin user!
      req.body.is_admin = user?.is_admin;
      req.body.is_staff = user?.is_staff;
      req.body.is_active = user?.is_active;
    }
    /*-----------------*/

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
          
              const {deletedCount} = await User.deleteOne({_id:req.params.id});
              if(deletedCount < 1){
                throw new CustomError('Something went wrong! - asked record is found, but it couldn\'t be deleted!',500)
              }
              res.sendStatus(204);



  },
};
