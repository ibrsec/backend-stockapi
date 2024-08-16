"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Brand } = require("../models/brandModel"); 

module.exports.brand = {
  list: async (req, res) => {
     /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "List Brands"
            #swagger.description = `
                List all brands!</br></br>
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

    const brands = await res.getModelList(Brand);
    res.status(200).json({
      error: false,
      message: "Brands are listed!",
      details: await res.getModelListDetails(Brand),
      data: brands,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Create new brand"
            #swagger.description = `
                Create a new brand!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Brand name should have a unique value</br>
                - name field Max Length:100</br>
                - Image field Max length : 1000, should match: http:// or https://</br> </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newBrandName',
                    $image: 'https://imageUrlExample.com'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new brand is created!!",
                data:{$ref: '#/definitions/Brand'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - name, image fields are required!`
            }



        */
    const { name, image} = req.body;

    if (!name || !image ) {
      throw new CustomError("name, image fields are required!", 400);
    }
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   throw new CustomError("Invalid id type(ObjectId)!", 400);
    // }

    // const user = await User.findOne({ _id: userId });
    // if (!user) {
    //   throw new CustomError("User not found on users!", 404);
    // }

    const newBrand = await Brand.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new brand is created!",
      data: newBrand,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Get a brand"
            #swagger.description = `
                Get a brand by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
            schema: { 
                error: false,
                message:  "Brand is found!!",
                data:{$ref: '#/definitions/Brand'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Brand not found! 
                      `
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: req.params.id });

    if (!brand) {
      throw new CustomError("Brand not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Brand is found!",
      data: brand,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Update brand"
            #swagger.description = `
                Update a new brand by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Brand name should have a unique value</br>
                - name field Max Length:100</br>
                - Image field Max length : 1000, should match: http:// or https://</br></br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newBrandName',
                    $image: 'https://brandImageUrlexample.com'
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Brand is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Brand'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name and image fields are required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Brand not found! 
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

    const { name, image} = req.body;

    if (!name || !image) {
      throw new CustomError("name and image fields are required!", 400);
    }

    const brandData = await Brand.findOne({ _id: req.params.id });
    if (!brandData) {
      throw new CustomError("Brand not found", 404);
    }

         //delete _id if it is sent
         if(req?.body?._id) delete req.body._id;
    


    const data = await Brand.updateOne(
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
      message: "Brand is updated!",
      data,
      new: await Brand.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {

    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Partially Update brand"
            #swagger.description = `
                Partially Update a new brand by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Brand name should have a unique value</br>
                - name field Max Length:100</br>
                - Image field Max length : 1000, should match: http:// or https://</br></br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the name, image field is required!",
                required:true,
                schema:{
                    $name : 'brandName',
                    $image: 'https://brandImageUrlexample.com'

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Brand is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Brand'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name or image field is required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Brand not found! 
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

    const { name, image } = req.body;

    if (!(name || image) ) {
      throw new CustomError("name  or image field is required!", 400);
    }
      

    const brandData = await Brand.findOne({ _id: req.params.id });
    if (!brandData) {
      throw new CustomError("Brand not found", 404);
    }

         //delete _id if it is sent
         if(req?.body?._id) delete req.body._id;
    


    const data = await Brand.updateOne(
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
      message: "Brand is partially updated!",
      data,
      new: await Brand.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Brands"]
            #swagger.summary = "Delete a brand"
            #swagger.description = `
                Delete a brand by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Brand is deleted!!",
                result:{$ref: '#/definitions/Brand'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Brand not found! 
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

    const brand = await Brand.findOne({ _id: req.params.id });

    if (!brand) {
      throw new CustomError("Brand not found!", 404);
    }

    const { deletedCount } = await Brand.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
