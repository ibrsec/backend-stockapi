"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Brand } = require("../models/brandModel");
const { Category } = require("../models/categoryModel");
const { Purchase } = require("../models/purchaseModel"); 

module.exports.purchase = {
  list: async (req, res) => {
     /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "List Purchases"
            #swagger.description = `
                List all purchases!</br></br>
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

    const purchases = await res.getModelList(Purchase,{},[
      {path:'category_id', select: '_id name '},
      {path:'brand_id', select: '_id name image'},
    ]);
    res.status(200).json({
      error: false,
      message: "Purchases are listed!",
      details: await res.getModelListDetails(Purchase),
      result: purchases,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Create new purchase"
            #swagger.description = `
                Create a new purchase!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Purchase name should have a unique value</br>
                - name field Max Length:100</br>
                - category_id should exist on categories</br>
                - brand_id should exist on brands</br>
                 </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newPurchaseName',
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new purchase is created!!",
                result:{$ref: '#/definitions/Purchase'} 
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
    const { name, category_id, brand_id} = req.body;

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



    const newPurchase = await Purchase.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new purchase is created!",
      result: newPurchase,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Get a purchase"
            #swagger.description = `
                Get a purchase by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
            schema: { 
                error: false,
                message:  "Purchase is found!!",
                result:{$ref: '#/definitions/Purchase'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Purchase not found! 
                      `
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const purchase = await Purchase.findOne({ _id: req.params.id }).populate([
      {path:'category_id', select: '_id name '},
      {path:'brand_id', select: '_id name image'},
    ]);

    if (!purchase) {
      throw new CustomError("Purchase not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Purchase is found!",
      result: purchase,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Update purchase"
            #swagger.description = `
                Update a new purchase by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Purchase name should have a unique value</br>
                - name field Max Length:100</br>
                - category_id should exist on categories</br>
                - brand_id should exist on brands</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newPurchaseName',
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Purchase is updated!!",
                result:{$ref: '#/definitions/Purchase'} 
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
                      </br>- Purchase not found! 
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



    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }

    

    const { modifiedCount } = await Purchase.updateOne(
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
      message: "Purchase is updated!",
      result: await Purchase.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {

    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Partially Update purchase"
            #swagger.description = `
                Partially Update a new purchase by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Purchase name should have a unique value</br>
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
                    $name : 'newPurchaseName',
                    $category_id: '66b9fddcc29ab216e263b04f',
                    $brand_id: '66b9f845453a084e04ef28ff',

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Purchase is partially updated!!",
                result:{$ref: '#/definitions/Purchase'} 
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
                      </br>- Purchase not found! 
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
      

    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }


    const { modifiedCount } = await Purchase.updateOne(
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
      message: "Purchase is partially updated!",
      result: await Purchase.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Delete a purchase"
            #swagger.description = `
                Delete a purchase by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Purchase is deleted!!",
                result:{$ref: '#/definitions/Purchase'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Purchase not found! 
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

    const purchase = await Purchase.findOne({ _id: req.params.id });

    if (!purchase) {
      throw new CustomError("Purchase not found!", 404);
    }

    const { deletedCount } = await Purchase.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
