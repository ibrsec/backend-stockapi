"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Category } = require("../models/categoryModel");

module.exports.category = {
  list: async (req, res) => {
     /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "List Categories"
            #swagger.description = `
                List all categories!</br></br>
                <b>Permission= Loginned user</b></br></br>
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `



        */

    const categories = await res.getModelList(Category);
    res.status(200).json({
      error: false,
      message: "Categories are listed!",
      details: await res.getModelListDetails(Category),
      data: categories,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Create new category"
            #swagger.description = `
                Create a new category!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Category name should have a unique value</br>
                - name field Max Length:100</br></br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newCategoryName'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new category is created!!",
                data:{$ref: '#/definitions/Category'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - name field is required!`
            }



        */
    const { name} = req.body;

    if (!name ) {
      throw new CustomError("name field is required!", 400);
    }
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   throw new CustomError("Invalid id type(ObjectId)!", 400);
    // }

    // const user = await User.findOne({ _id: userId });
    // if (!user) {
    //   throw new CustomError("User not found on users!", 404);
    // }

    const newCategory = await Category.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new category is created!",
      data: newCategory,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Get a category"
            #swagger.description = `
                Get a category by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
            schema: { 
                error: false,
                message:  "Category is found!!",
                data:{$ref: '#/definitions/Category'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Category not found! 
                      `
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: req.params.id });

    if (!category) {
      throw new CustomError("Category not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Category is found!",
      data: category,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Update category"
            #swagger.description = `
                Update a new category by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Category name should have a unique value</br>
                - name field Max Length:100</br></br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newCategoryName'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Category is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Category'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name field is required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Category not found! 
                      `
            }
            #swagger.responses[500] = {
            description:`Something went wrong! - asked record is found, but it couldn't be updated! 
                      `
            }



        */


    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid param id type(ObjectId)!", 400);
    }

    const { name} = req.body;

    if (!name) {
      throw new CustomError("name field is required!", 400);
    }

    const categoryData = await Category.findOne({ _id: req.params.id });
    if (!categoryData) {
      throw new CustomError("Category not found", 404);
    }

    

    const data = await Category.updateOne(
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
      message: "Category is updated!",
      data,
      new: await Category.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {

    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Partially Update category"
            #swagger.description = `
                Partially Update a new category by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Category name should have a unique value</br>
                - name field Max Length:100</br></br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the name, phone, address, image field is required!",
                required:true,
                schema:{
                    $name : 'categoryName'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Category is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Category'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name field is required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Category not found! 
                      `
            }


            #swagger.responses[500] = {
            description:`Something went wrong! - asked record is found, but it couldn't be updated! 
                      `
            }

        */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const { name } = req.body;

    if (!name ) {
      throw new CustomError("name field is required!", 400);
    }
      

    const categoryData = await Category.findOne({ _id: req.params.id });
    if (!categoryData) {
      throw new CustomError("Category not found", 404);
    }


    const data = await Category.updateOne(
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
      message: "Category is partially updated!",
      data,
      new: await Category.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Delete a category"
            #swagger.description = `
                Delete a category by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Category is deleted!!",
                result:{$ref: '#/definitions/Category'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Category not found! 
                      `
            }
            #swagger.responses[500] = {
            description:`Something went wrong! - asked record is found, but it couldn't be updated! 
                      `
            }



        */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: req.params.id });

    if (!category) {
      throw new CustomError("Category not found!", 404);
    }

    const { deletedCount } = await Category.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
