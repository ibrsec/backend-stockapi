"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Brand } = require("../models/brandModel");
const { Firm } = require("../models/firmModel");
const { Product } = require("../models/productModel");
const { Sale } = require("../models/saleModel");
const { User } = require("../models/userModel");

module.exports.sale = {
  list: async (req, res) => {
    /*
          #swagger.tags = ["Sales"]
          #swagger.summary = "List Sales"
          #swagger.description = `
              List all sales!</br></br>
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

    const sales = await res.getModelList(Sale, {}, [
      "product_id",
      "brand_id",
      "user_id",
    ]);
    res.status(200).json({
      error: false,
      message: "Sales are listed!",
      details: await res.getModelListDetails(Sale),
      result: sales,
    });
  },
  create: async (req, res) => {
    /*
          #swagger.tags = ["Sales"]
          #swagger.summary = "Create new sale"
          #swagger.description = `
              Create a new sale!</br></br>
              <b>Permission= Loginned User</b></br>   
              - product_id should exist on products</br> 
               </br>
          `
          #swagger.parameters['body']={
              in:'body',
              required:true,
              schema:{
                  $product_id : '66b9fddcc29ab216e263b04f',  
                  $quantity: 150,
                  $price: 50,
              }
          }
          #swagger.responses[201] = {
          description: 'Successfully created!',
          schema: { 
              error: false,
              message: "A new sale is created!!",
              result:{$ref: '#/definitions/Sale'} 
          }
  
      }  
          #swagger.responses[400] = {
          description:`Bad request:
                        </br> - product_id, price, quantity fields are required!
                        </br> - Invalid brand_id, user_id, product_id type(ObjectId)!
                        </br> - Invalid quantity - it can\'t be less than 1!
                      `
          }
          #swagger.responses[404] = {
          description:`Not found:
                        </br> - Product not found on products!
                        </br> - Brand not found on brands! 
                        </br> - User not found on brands!
                      `
          }
  
  
  
      */
    const { product_id, price, quantity } = req.body;

    if (!product_id || !price || !quantity) {
      throw new CustomError(
        "product_id, price, quantity fields are required!",
        400
      );
    }
    if (quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check product, user, firm and brand
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      throw new CustomError("Invalid product_id type(ObjectId)!", 400);
    }

    const product = await Product.findOne({ _id: product_id });
    if (!product) {
      throw new CustomError("Product not found on products!", 404);
    }

    //---

    //user_id comes from req user
    req.body.user_id = req.user?._id;

    //brand_id comes from product's brand_id
    req.body.brand_id = product?.brand_id;

    const { user_id, brand_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid user_id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(brand_id)) {
      throw new CustomError("Invalid brand_id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }

    if (product?.quantity < quantity) {
      throw new CustomError(
        `Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity:${quantity}`,
        400
      );
    }

    const newSale = await Sale.create(req.body);
    // increase the product quantity
    const updateProductQuantity = await Product.updateOne(
      { _id: product_id },
      { quantity: product.quantity - req.body.quantity },
      { runValidators: true }
    );
    let modifyMessage = "";
    if (updateProductQuantity?.modifiedCount < 1) {
      modifyMessage =
        " - note: Something went wrong: Sale is created but product couldn't be updated!";
    }

    res.status(201).json({
      error: false,
      message: "A new sale is created!" + modifyMessage,
      result: newSale,
    });
  },
  read: async (req, res) => {
    /*
          #swagger.tags = ["Sales"]
          #swagger.summary = "Get a sale"
          #swagger.description = `
              Get a sale by id!</br></br>
              <b>Permission= Loginned User</b></br></br>
          `
          #swagger.responses[200] = {
          description: 'Successfully Found!',
          schema: { 
              error: false,
              message:  "Sale is found!!",
              result:{$ref: '#/definitions/Sale'} 
          }
  
      }  
          #swagger.responses[400] = {
          description:`Bad request - Invalid param id type(ObjectId)!!
                    `
          }
          #swagger.responses[404] = {
          description:`Not found - Sale not found! 
                    `
          }
  
  
  
      */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type(ObjectId)!", 400);
    }

    const sale = await Sale.findOne({ _id: req.params.id }).populate([
      "product_id",
      "brand_id",
      "user_id",
    ]);

    if (!sale) {
      throw new CustomError("Sale not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Sale is found!",
      result: sale,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Update sale"
            #swagger.description = `
                Update a new sale by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - product_id should exist on products</br> 
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $product_id: '66b9fddcc29ab216e263b04f',  
                    $quantity: 150,
                    $price: 50,
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Sale is updated!!",
                result:{$ref: '#/definitions/Sale'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>-product_id, price, quantity fields are required!
                      </br> - Invalid param id, brand_id, user_id, product_id type(ObjectId)!
                      </br> - Invalid quantity - it can\'t be less than 1!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Sale not found!  
                      </br> - Product not found on products!
                      </br> - Brand not found on brands! 
                      </br> - User not found on brands!
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

    const { product_id, price, quantity } = req.body;

    if (!product_id || !price || !quantity) {
      throw new CustomError(
        "product_id, price, quantity fields are required!",
        400
      );
    }

    if (quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check user, firm and brand

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      throw new CustomError("Invalid product_id type(ObjectId)!", 400);
    }

    const product = await Product.findOne({ _id: product_id });
    if (!product) {
      throw new CustomError("Product not found on products!", 404);
    }

    //---

    //user_id comes from req user
    req.body.user_id = req.user?._id;

    //brand_id comes from product's brand_id
    req.body.brand_id = product?.brand_id;

    const { user_id, brand_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid user_id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(brand_id)) {
      throw new CustomError("Invalid brand_id type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand) {
      throw new CustomError("Brand not found on brands!", 404);
    }

    const saleData = await Sale.findOne({ _id: req.params.id });
    if (!saleData) {
      throw new CustomError("Sale not found", 404);
    }

    const oldQuantity = saleData?.quantity;
    const updateQuantityAmount = quantity - saleData?.quantity;

    //control of if quantity of product is enough for update!
    if (saleData?.product_id == product_id) {
      //product is not changing so
      //quantity is already included products quantity
      if (updateQuantityAmount > 0) {
        if (product?.quantity < updateQuantityAmount) {
          throw new CustomError(
            `Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity amount(new quantity - old quantity):${updateQuantityAmount}`,
            400
          );
        }
      }
    } else {
      //if product id will be updated->
      //product is changing and quantity is not included to new product->
      if (product?.quantity < quantity) {
        throw new CustomError(
          `Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity :${quantity}`,
          400
        );
      }
    }

    //make main update at sale->
    const { modifiedCount } = await Sale.updateOne(
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

    const updatedSale = await Sale.findOne({ _id: req.params.id });

    const newQuantity = updatedSale?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (saleData?.product_id != product_id) {
      //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
      //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

      const oldProduct = await Product.findOne({
        _id: saleData?.product_id,
      });
      //add  old product's quantity
      const oldProductUpdateQuantity = await Product.updateOne(
        { _id: saleData?.product_id },
        { quantity: oldProduct.quantity + oldQuantity },
        { runValidators: true }
      );

      if (oldProductUpdateQuantity?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is updated but old product couldn't be updated!";
      }

      //delete quantity from new product
      const updateQuantityofProduct = await Product.updateOne(
        { _id: product_id },
        { quantity: product.quantity - updatedSale?.quantity }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is updated but new product couldn't be updated!";
      }
    } else {
      //if product id is not changed!
      const updateQuantityofProduct = await Product.updateOne(
        { _id: product_id },
        { quantity: product.quantity - (newQuantity - oldQuantity) }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is created but product couldn't be updated!";
      }
    }

    res.status(202).json({
      error: false,
      message: "Sale is updated!" + modifyMessage,
      result: updatedSale,
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Partially Update sale"
            #swagger.description = `
                Partially Update a new sale by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - product_id should exist on products</br>  
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the product_id, firm_id, price, quantity field is required!",
                required:true,
                schema:{
                    product_id : '66b9fddcc29ab216e263b04f',  
                    quantity: 150,
                    price: 50,

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Sale is partially updated!!",
                result:{$ref: '#/definitions/Sale'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- product_id or price or quantity field is required!
                      </br>- Invalid param id, brand_id, user_id, product_id type(ObjectId)!!
                      </br>- Invalid quantity - it can\'t be less than 1!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Sale not found! 
                          </br> - Product not found on products!
                          </br> - Brand not found on brands! 
                          </br> - User not found on brands!
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

    const { product_id, price, quantity } = req.body;

    if (!(product_id || price || quantity)) {
      throw new CustomError(
        "product_id or price or quantity field is required!",
        400
      );
    }

    if (quantity && quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check product, user, firm and brand
    let product = null;
    let firm = null;

    if (product_id) {
      if (!mongoose.Types.ObjectId.isValid(product_id)) {
        throw new CustomError("Invalid product_id type(ObjectId)!", 400);
      }

      product = await Product.findOne({ _id: product_id });
      if (!product) {
        throw new CustomError("Product not found on products!", 404);
      }
      //brand_id comes from product's brand_id
      req.body.brand_id = product?.brand_id;
    } else {
    }

    //---

    //user_id comes from req user
    req.body.user_id = req.user?._id;

    const { user_id, brand_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new CustomError("Invalid user_id type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (brand_id) {
      if (!mongoose.Types.ObjectId.isValid(brand_id)) {
        throw new CustomError("Invalid brand_id type(ObjectId)!", 400);
      }

      const brand = await Brand.findOne({ _id: brand_id });
      if (!brand) {
        throw new CustomError("Brand not found on brands!", 404);
      }
    }

    const saleData = await Sale.findOne({ _id: req.params.id });
    if (!saleData) {
      throw new CustomError("Sale not found", 404);
    }
    const oldProduct = await Product.findOne({
      _id: saleData?.product_id,
    });

    const oldQuantity = saleData?.quantity;

    //control of if quantity of product is enough for update!

    //quantity gonderildiyse product_id yeni gonderildiyse
    //quantity gonderildiyse product_id yeni gonderilmediyse
    //quantity gonderilmediyse product_id yeni gonderildiyse
    //quantity gonderilmediyse product_id yeni gonderilmediyse

    if (quantity) {
      //quantitiy is exist
      const updateQuantityAmount = quantity - oldQuantity;
      if (product_id) {
        if (saleData?.product_id == product_id) {
          //product is not changing so
          //quantity is already included products quantity
          if (updateQuantityAmount > 0) {
            if (product?.quantity < updateQuantityAmount) {
              throw new CustomError(
                `Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity amount(new quantity - old quantity):${updateQuantityAmount}`,
                400
              );
            }
          }
        } else {
          //if product id will be updated->
          //product is changing and quantity is not included to new product->
          if (product?.quantity < quantity) {
            throw new CustomError(
              `Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity :${quantity}`,
              400
            );
          }
        }
      }else {
        if (updateQuantityAmount > 0) {
          console.log("oldProduct?.quantity", oldProduct?.quantity);
          console.log("updateQuantityAmount", updateQuantityAmount);
          if (oldProduct?.quantity < updateQuantityAmount) {
            throw new CustomError(
              `Insufficient product quantity! - product quantity:${oldProduct?.quantity}, sale quantity amount :${updateQuantityAmount}`,
              400
            );
          }
        }
      }
    } else {
      //quanitity is not exist
      if (product_id) {
        if (product_id != saleData.product_id) {
          if (product?.quantity < saleData?.quantity) {
            throw new CustomError(
              `Insufficient product quantity! - new product's quantity is not enough - new product quantity:${product?.quantity}, sale quantity :${saleData?.quantity}`,
              400
            );
          }
        }
      }
    }

    //MAIN UPDATE PART ->
    const { modifiedCount } = await Sale.updateOne(
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

    const updatedSale = await Sale.findOne({ _id: req.params.id });

    const newQuantity = updatedSale?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (product_id) {
      // if product id is not null
      if (saleData?.product_id != product_id) {
        //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
        //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

        const oldProductUpdateQuantity = await Product.updateOne(
          { _id: saleData?.product_id },
          { quantity: oldProduct.quantity + oldQuantity },
          { runValidators: true }
        );

        if (oldProductUpdateQuantity?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but old product couldn't be updated!";
        }

        const updateQuantityofProduct = await Product.updateOne(
          { _id: product_id },
          { quantity: product.quantity - updatedSale?.quantity }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but new product couldn't be updated!";
        }
      } else {
        const updateQuantityofProduct = await Product.updateOne(
          { _id: product_id },
          { quantity: product.quantity - (newQuantity - oldQuantity) }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but product couldn't be updated!";
        }
      }
    } else {
      //if product_id is null
      const updateQuantityofProduct = await Product.updateOne(
        { _id: saleData?.product_id },
        { quantity: oldProduct.quantity - (newQuantity - oldQuantity) }
      );
      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is updated but product couldn't be updated!";
      }
    }

    res.status(202).json({
      error: false,
      message: "Sale is partially updated!" + modifyMessage,
      result: updatedSale,
    });
  },
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Delete a sale"
            #swagger.description = `
                Delete a sale by id!</br></br>
                <b>Permission= Loginned User</b></br></br>
            `
            #swagger.responses[200] = {
            description: 'Successfully Deleted!',
            schema: { 
                error: false,
                message:  "Sale is deleted!!",
                result:{$ref: '#/definitions/Sale'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request - Invalid param id type(ObjectId)!!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found - Sale not found! 
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

    const sale = await Sale.findOne({ _id: req.params.id });

    if (!sale) {
      throw new CustomError("Sale not found!", 404);
    }

    const { deletedCount } = await Sale.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }

    const product = await Product.findOne({ _id: sale?.product_id });

    const deleteProductQuantity = await Product.updateOne(
      { _id: sale?.product_id },
      { quantity: product?.quantity + sale.quantity }
    );

    res.sendStatus(204);
  },
};
