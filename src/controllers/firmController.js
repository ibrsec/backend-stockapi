"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Firm } = require("../models/firmModel"); 

module.exports.firm = {
  list: async (req, res) => {
     /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "List Firms"
            #swagger.description = `
                List all firms!</br></br>
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

    const firms = await res.getModelList(Firm);
    res.status(200).json({
      error: false,
      message: "Firms are listed!",
      details: await res.getModelListDetails(Firm),
      data: firms,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Create new firm"
            #swagger.description = `
                Create a new firm!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Firm name should have a unique value</br>
                - name field Max Length:100</br>
                - Phone field: String,  Max Length:11, [0-9]</br>
                - address field Max Length:200</br>
                - Image field Max length : 1000, should match: http:// or https://</br> </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newFirmName',
                    $phone : '99911122233',
                    $address : '23 st. no:2 City',
                    $image : 'https://exampleImageUurl.com'

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new firm is created!!",
                data:{$ref: '#/definitions/Firm'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - name, phone, address, image fields are required!`
            }



        */
    const { name,phone,address,image } = req.body;

    if (!name || !phone || !address || !image) {
      throw new CustomError("name, phone, address, image fields are required!", 400);
    }
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   throw new CustomError("Invalid id type(ObjectId)!", 400);
    // }

    // const user = await User.findOne({ _id: userId });
    // if (!user) {
    //   throw new CustomError("User not found on users!", 404);
    // }

    const newFirm = await Firm.create(req.body);
    res.status(201).json({
      error: false,
      message: "A new firm is created!",
      data: newFirm,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Get a firm"
            #swagger.description = `
                Get a firm by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Found!',
            schema: { 
                error: false,
                message:  "Firm is found!!",
                data:{$ref: '#/definitions/Firm'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Firm not found! 
                      `
            }



        */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const firm = await Firm.findOne({ _id: req.params.id });

    if (!firm) {
      throw new CustomError("Firm not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Firm is found!",
      data: firm,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Update firm"
            #swagger.description = `
                Update a new firm by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Firm name should have a unique value</br>
                - name field Max Length:100</br>
                - Phone field: String,  Max Length:11, [0-9]</br>
                - address field Max Length:200</br>
                - Image field Max length : 1000, should match: http:// or https://</br> </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $name : 'newFirmName',
                    $phone : '99911122233',
                    $address : '23 st. no:2 City',
                    $image : 'https://exampleImageUurl.com'

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "firm is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Firm'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- name, phone, address, image fields are required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Firm not found! 
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

    const { name,phone,address,image } = req.body;

    if (!name || !phone || !address || !image) {
      throw new CustomError("name, phone, address, image fields are required!", 400);
    }

    const firmData = await Firm.findOne({ _id: req.params.id });
    if (!firmData) {
      throw new CustomError("Firm not found", 404);
    }

     //delete _id if it is sent
     if(req?.body?._id) delete req.body._id;
    

    const data = await Firm.updateOne(
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
      message: "Firm is updated!",
      data,
      new: await Firm.findOne({ _id: req.params.id }),
    });
  },
  partialUpdate: async (req, res) => {

    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Partially Update firm"
            #swagger.description = `
                Partially Update a new firm by id!</br></br>
                <b>Permission= Loginned User</b></br> 
                - Firm name should have a unique value</br>
                - name field Max Length:100</br>
                - Phone field: String,  Max Length:11, [0-9]</br>
                - address field Max Length:200</br>
                - Image field Max length : 1000, should match: http:// or https://</br> </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the name, phone, address, image field is required!",
                required:true,
                schema:{
                    $name : 'firmName',
                    $phone : '99911122233',
                    $address : '23 st. no:2 City',
                    $image : 'https://exampleImageUurl.com'

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Firm is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Firm'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- At least one of the name, phone, address, image field is required!
                      </br>- Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Firm not found! 
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

    const { name,phone,address,image } = req.body;

    if (!(name || phone || address || image)) {
      throw new CustomError("At least one of the name, phone, address, image field is required!", 400);
    }
      

    const firmData = await Firm.findOne({ _id: req.params.id });
    if (!firmData) {
      throw new CustomError("Firm not found", 404);
    }

 //delete _id if it is sent
 if(req?.body?._id) delete req.body._id;
    
 
    const data = await Firm.updateOne(
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
      message: "Firm is partially updated!",
      data,
      new: await Firm.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Firms"]
            #swagger.summary = "Delete a firm"
            #swagger.description = `
                Delete a firm by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Firm is deleted!!",
                result:{$ref: '#/definitions/Firm'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Firm not found! 
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

    const firm = await Firm.findOne({ _id: req.params.id });

    if (!firm) {
      throw new CustomError("Firm not found!", 404);
    }

    const { deletedCount } = await Firm.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }
    res.sendStatus(204);
  },
};
