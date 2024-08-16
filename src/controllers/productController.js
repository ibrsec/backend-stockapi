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
      'categoryId',
      'brandId',
    ]);
    res.status(200).json({
      error: false,
      message: "Products are listed!",
      details: await res.getModelListDetails(Product),
      data: products,
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
                - categoryId should exist on categories</br>
                - brandId should exist on brands</br>
                 </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newProductName', 
                    $categoryId: '66b9fddcc29ab216e263b04f',
                    $brandId: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new product is created!!",
                data:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request:
                          </br> - name, categoryId, brandId fields are required!
                          </br> - Invalid categoryId, brandId type(ObjectId)!
                        `
            }
            #swagger.responses[404] = {
            description:`Not found:
                          </br> - Category not found on categories!
                          </br> - Brand not found on brands!
                        `
            }



        */
    const { name, categoryId, brandId, quantity} = req.body;

    if (!name || !categoryId || !brandId ) {
      throw new CustomError("name, categoryId, brandId fields are required!", 400);
    }



    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CustomError("Invalid categoryId type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new CustomError("Invalid brandId type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brandId });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }

    delete req.body.quantity;


    const newProduct = await Product.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new product is created!",
      data: newProduct,
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
                data:{$ref: '#/definitions/Product'} 
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
      {path:'categoryId', select: '_id name '},
      {path:'brandId', select: '_id name image'},
    ]);

    if (!product) {
      throw new CustomError("Product not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Product is found!",
      data: product,
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
                - categoryId should exist on categories</br>
                - brandId should exist on brands</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newProductName',
                    $categoryId: '66b9fddcc29ab216e263b04f',
                    $brandId: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Product is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name, categoryId, brandId fields are required!
                      </br> - Invalid param id, categoryId, brandId type(ObjectId)!
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

    const { name, categoryId, brandId} = req.body;

    if (!name || !categoryId || !brandId) {
      throw new CustomError("name, categoryId, brandId fields are required!", 400);
    }




    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CustomError("Invalid categoryId type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new CustomError("Invalid categoryId type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brandId });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }




    
    
    const productData = await Product.findOne({ _id: req.params.id });
    if (!productData) {
      throw new CustomError("Product not found", 404);
    }
    
    // delete req.body.quantity;
    
    //delete _id if it is sent
    if(req?.body?._id) delete req.body._id;

    //main update
    const data = await Product.updateOne(
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
      message: "Product is updated!",
      data,
      new: await Product.findOne({ _id: req.params.id }),
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
                - categoryId should exist on categories</br>
                - brandId should exist on brands</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the name, categoryId, brandId field is required!",
                required:true,
                schema:{
                    $name : 'newProductName',
                    $categoryId: '66b9fddcc29ab216e263b04f',
                    $brandId: '66b9f845453a084e04ef28ff',

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Product is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Product'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name or categoryId or brandId field is required!
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

    const { name, categoryId, brandId } = req.body;

    if (!(name || categoryId || brandId) ) {
      throw new CustomError("name or categoryId or brandId field is required!", 400);
    }
      

    //check category and brand
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CustomError("Invalid categoryId type(ObjectId)!", 400);
    }

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      throw new CustomError("Category not found on categories!", 404);
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new CustomError("Invalid categoryId type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brandId });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }


    

    const productData = await Product.findOne({ _id: req.params.id });
    if (!productData) {
      throw new CustomError("Product not found", 404);
    }

    //delete _id if it is sent
    if(req?.body?._id) delete req.body._id;
    
    //main update
    const data = await Product.updateOne(
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
      message: "Product is partially updated!",
      data,
      new: await Product.findOne({ _id: req.params.id }),
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
