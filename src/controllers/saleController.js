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
      "productId",
      "brandId",
      "userId",
    ]);
    res.status(200).json({
      error: false,
      message: "Sales are listed!",
      details: await res.getModelListDetails(Sale),
      data: sales,
    });
  },
  create: async (req, res) => {
    /*
          #swagger.tags = ["Sales"]
          #swagger.summary = "Create new sale"
          #swagger.description = `
              Create a new sale!</br></br>
              <b>Permission= Loginned User</b></br>   
              - productId should exist on products</br> 
               </br>
          `
          #swagger.parameters['body']={
              in:'body',
              required:true,
              schema:{
                  $productId : '66b9fddcc29ab216e263b04f',  
                  $quantity: 150,
                  $price: 50,
              }
          }
          #swagger.responses[201] = {
          description: 'Successfully created!',
          schema: { 
              error: false,
              message: "A new sale is created!!",
              data:{$ref: '#/definitions/Sale'} 
          }
  
      }  
          #swagger.responses[400] = {
          description:`Bad request:
                        </br> - productId, price, quantity fields are required!
                        </br> - Invalid brandId, userId, productId type(ObjectId)!
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
    const { productId, price, quantity } = req.body;

    if (!productId || !price || !quantity) {
      throw new CustomError(
        "productId, price, quantity fields are required!",
        400
      );
    }
    if (quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check product, user, firm and brand
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CustomError("Invalid productId type(ObjectId)!", 400);
    }

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      throw new CustomError("Product not found on products!", 404);
    }

    //---

    //userId comes from req user
    req.body.userId = req.user?._id;

    //brandId comes from product's brandId
    req.body.brandId = product?.brandId;

    const { userId, brandId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new CustomError("Invalid brandId type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brandId });
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
      { _id: productId },
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
      data: newSale,
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
              data:{$ref: '#/definitions/Sale'} 
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
      "productId",
      "brandId",
      "userId",
    ]);

    if (!sale) {
      throw new CustomError("Sale not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Sale is found!",
      data: sale,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Update sale"
            #swagger.description = `
                Update a new sale by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - productId should exist on products</br> 
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $productId: '66b9fddcc29ab216e263b04f',  
                    $quantity: 150,
                    $price: 50,
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Sale is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Sale'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>-productId, price, quantity fields are required!
                      </br> - Invalid param id, brandId, userId, productId type(ObjectId)!
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

    const { productId, price, quantity } = req.body;

    if (!productId || !price || !quantity) {
      throw new CustomError(
        "productId, price, quantity fields are required!",
        400
      );
    }

    if (quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check user, firm and brand

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CustomError("Invalid productId type(ObjectId)!", 400);
    }

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      throw new CustomError("Product not found on products!", 404);
    }

    //---

    //userId comes from req user
    req.body.userId = req.user?._id;

    //brandId comes from product's brandId
    req.body.brandId = product?.brandId;

    const { userId, brandId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new CustomError("Invalid brandId type(ObjectId)!", 400);
    }

    const brand = await Brand.findOne({ _id: brandId });
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
    if (saleData?.productId == productId) {
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
    const data = await Sale.updateOne(
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

    const updatedSale = await Sale.findOne({ _id: req.params.id });

    const newQuantity = updatedSale?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (saleData?.productId != productId) {
      //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
      //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

      const oldProduct = await Product.findOne({
        _id: saleData?.productId,
      });
      //add  old product's quantity
      const oldProductUpdateQuantity = await Product.updateOne(
        { _id: saleData?.productId },
        { quantity: oldProduct.quantity + oldQuantity },
        { runValidators: true }
      );

      if (oldProductUpdateQuantity?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is updated but old product couldn't be updated!";
      }

      //delete quantity from new product
      const updateQuantityofProduct = await Product.updateOne(
        { _id: productId },
        { quantity: product.quantity - updatedSale?.quantity }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Sale is updated but new product couldn't be updated!";
      }
    } else {
      //if product id is not changed!
      const updateQuantityofProduct = await Product.updateOne(
        { _id: productId },
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
      data,
      new: updatedSale,
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Partially Update sale"
            #swagger.description = `
                Partially Update a new sale by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - productId should exist on products</br>  
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the productId, firmId, price, quantity field is required!",
                required:true,
                schema:{
                    productId : '66b9fddcc29ab216e263b04f',  
                    quantity: 150,
                    price: 50,

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Sale is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Sale'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- productId or price or quantity field is required!
                      </br>- Invalid param id, brandId, userId, productId type(ObjectId)!!
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

    const { productId, price, quantity } = req.body;

    if (!(productId || price || quantity)) {
      throw new CustomError(
        "productId or price or quantity field is required!",
        400
      );
    }

    if (quantity && quantity < 1) {
      throw new CustomError("Invalid quantity - it can't be less than 1!", 400);
    }

    //check product, user, firm and brand
    let product = null;
    let firm = null;

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new CustomError("Invalid productId type(ObjectId)!", 400);
      }

      product = await Product.findOne({ _id: productId });
      if (!product) {
        throw new CustomError("Product not found on products!", 404);
      }
      //brandId comes from product's brandId
      req.body.brandId = product?.brandId;
    } else {
    }

    //---

    //userId comes from req user
    req.body.userId = req.user?._id;

    const { userId, brandId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type(ObjectId)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on users!", 404);
    }

    if (brandId) {
      if (!mongoose.Types.ObjectId.isValid(brandId)) {
        throw new CustomError("Invalid brandId type(ObjectId)!", 400);
      }

      const brand = await Brand.findOne({ _id: brandId });
      if (!brand) {
        throw new CustomError("Brand not found on brands!", 404);
      }
    }

    const saleData = await Sale.findOne({ _id: req.params.id });
    if (!saleData) {
      throw new CustomError("Sale not found", 404);
    }
    const oldProduct = await Product.findOne({
      _id: saleData?.productId,
    });

    const oldQuantity = saleData?.quantity;

    //control of if quantity of product is enough for update!

    //quantity gonderildiyse productId yeni gonderildiyse
    //quantity gonderildiyse productId yeni gonderilmediyse
    //quantity gonderilmediyse productId yeni gonderildiyse
    //quantity gonderilmediyse productId yeni gonderilmediyse

    if (quantity) {
      //quantitiy is exist
      const updateQuantityAmount = quantity - oldQuantity;
      if (productId) {
        if (saleData?.productId == productId) {
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
      if (productId) {
        if (productId != saleData.productId) {
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
    const data = await Sale.updateOne(
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

    const updatedSale = await Sale.findOne({ _id: req.params.id });

    const newQuantity = updatedSale?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (productId) {
      // if product id is not null
      if (saleData?.productId != productId) {
        //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
        //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

        const oldProductUpdateQuantity = await Product.updateOne(
          { _id: saleData?.productId },
          { quantity: oldProduct.quantity + oldQuantity },
          { runValidators: true }
        );

        if (oldProductUpdateQuantity?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but old product couldn't be updated!";
        }

        const updateQuantityofProduct = await Product.updateOne(
          { _id: productId },
          { quantity: product.quantity - updatedSale?.quantity }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but new product couldn't be updated!";
        }
      } else {
        const updateQuantityofProduct = await Product.updateOne(
          { _id: productId },
          { quantity: product.quantity - (newQuantity - oldQuantity) }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Sale is updated but product couldn't be updated!";
        }
      }
    } else {
      //if productId is null
      const updateQuantityofProduct = await Product.updateOne(
        { _id: saleData?.productId },
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
      data,
      new: updatedSale,
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

    const product = await Product.findOne({ _id: sale?.productId });

    const deleteProductQuantity = await Product.updateOne(
      { _id: sale?.productId },
      { quantity: product?.quantity + sale.quantity }
    );

    res.sendStatus(204);
  },
};
