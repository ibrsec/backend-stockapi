"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Brand } = require("../models/brandModel");
const { Category } = require("../models/categoryModel");
const { Product } = require("../models/productModel"); 

module.exports.product = {
  list: async (req, res) => {
     /*
            #swagger.tags = ["Products"]
            #swagger.summary = "List Products"
            #swagger.description = `
                List all products!</br></br>
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

    const products = await res.getModelList(Product,{},[
      'category_id',
      'brand_id',
    ]);
    res.status(200).json({
      error: false,
      message: "Products are listed!",
      details: await res.getModelListDetails(Product),
      result: products,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Create new product"
            #swagger.description = `
                Create a new product!</br></br>
                <b>Permission= Loginned User</b></br>  
                - name field Max Length:100</br>
                - category_id should exist on categories</br>
                - brand_id should exist on brands</br>
                 </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newProductName', 
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new product is created!!",
                result:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request:
                          </br> - name, category_id, brand_id fields are required!
                          </br> - Invalid category_id, brand_id type(ObjectId)!
                        `
            }
            #swagger.responses[404] = {
            description:`Not found:
                          </br> - Category not found on categories!
                          </br> - Brand not found on brands!
                        `
            }



        */
    const { name, category_id, brand_id, quantity} = req.body;

    if (!name || !category_id || !brand_id ) {
      throw new CustomError("name, category_id, brand_id fields are required!", 400);
    }



    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      throw new CustomError("Invalid category_id type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: category_id });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brand_id)) {
      throw new CustomError("Invalid brand_id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }

    delete req.body.quantity;


    const newProduct = await Product.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new product is created!",
      result: newProduct,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Get a product"
            #swagger.description = `
                Get a product by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
            schema: { 
                error: false,
                message:  "Product is found!!",
                result:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Product not found! 
                      `
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const product = await Product.findOne({ _id: req.params.id }).populate([
      {path:'category_id', select: '_id name '},
      {path:'brand_id', select: '_id name image'},
    ]);

    if (!product) {
      throw new CustomError("Product not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Product is found!",
      result: product,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Update product"
            #swagger.description = `
                Update a new product by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Product name should have a unique value</br>
                - name field Max Length:100</br>
                - category_id should exist on categories</br>
                - brand_id should exist on brands</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newProductName',
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Product is updated!!",
                result:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name, category_id, brand_id fields are required!
                      </br> - Invalid param id, category_id, brand_id type(ObjectId)!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Product not found! 
                      </br> - Category not found on categories!
                      </br> - Brand not found on brands!
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

    const { name, category_id, brand_id} = req.body;

    if (!name || !category_id || !brand_id) {
      throw new CustomError("name, category_id, brand_id fields are required!", 400);
    }




    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      throw new CustomError("Invalid category_id type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: category_id });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brand_id)) {
      throw new CustomError("Invalid category_id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }




    
    
    const productData = await Product.findOne({ _id: req.params.id });
    if (!productData) {
      throw new CustomError("Product not found", 404);
    }
    
    // delete req.body.quantity;
    

    const { modifiedCount } = await Product.updateOne(
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
      message: "Product is updated!",
      result: await Product.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {

    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Partially Update product"
            #swagger.description = `
                Partially Update a new product by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Product name should have a unique value</br>
                - name field Max Length:100</br>
                - category_id should exist on categories</br>
                - brand_id should exist on brands</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the name, category_id, brand_id field is required!",
                required:true,
                schema:{
                    $name : 'newProductName',
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Product is partially updated!!",
                result:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name or category_id or brand_id field is required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Product not found! 
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

    const { name, category_id, brand_id } = req.body;

    if (!(name || category_id || brand_id) ) {
      throw new CustomError("name or category_id or brand_id field is required!", 400);
    }
      

    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      throw new CustomError("Invalid category_id type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: category_id });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brand_id)) {
      throw new CustomError("Invalid category_id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }


    

    const productData = await Product.findOne({ _id: req.params.id });
    if (!productData) {
      throw new CustomError("Product not found", 404);
    }


    const { modifiedCount } = await Product.updateOne(
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
      message: "Product is partially updated!",
      result: await Product.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Products"]
            #swagger.summary = "Delete a product"
            #swagger.description = `
                Delete a product by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Product is deleted!!",
                result:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Product not found! 
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

    const product = await Product.findOne({ _id: req.params.id });

    if (!product) {
      throw new CustomError("Product not found!", 404);
    }

    const { deletedCount } = await Product.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
