"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Brand } = require("../models/brandModel");
const { Firm } = require("../models/firmModel");
const { Product } = require("../models/productModel");
const { Purchase } = require("../models/purchaseModel");
const { User } = require("../models/userModel");

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

    const purchases = await res.getModelList(Purchase, {}, [
      "product_id",
      "brand_id",
      "firm_id",
      "user_id",
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
                - product_id should exist on products</br> 
                - firm_id should exist on firms</br>
                 </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $product_id : '66b9fddcc29ab216e263b04f', 
                    $firm_id: '66b9fddcc29ab216e263b04f', 
                    $quantity: 150,
                    $price: 50,
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
                          </br> - product_id, firm_id, price, quantity fields are required!
                          </br> - Invalid brand_id, firm_id, user_id, product_id type(ObjectId)!
                          </br> - Invalid quantity - it can\'t be less than 1!
                        `
            }
            #swagger.responses[404] = {
            description:`Not found:
                          </br> - Product not found on products!
                          </br> - Brand not found on brands!
                          </br> - Firm not found on brands!
                          </br> - User not found on brands!
                        `
            }



        */
    const { product_id, firm_id, price, quantity } = req.body;

    if (!product_id || !firm_id || !price || !quantity) {
      throw new CustomError(
        "product_id, firm_id, price, quantity fields are required!",
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

    if (!mongoose.Types.ObjectId.isValid(firm_id)) {
      throw new CustomError("Invalid firm_id type(ObjectId)!", 400);
    }

    const firm = await Firm.findOne({ _id: firm_id });
    if (!firm) {
      throw new CustomError("Firm not found on firms!", 404);
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

    const newPurchase = await Purchase.create(req.body);
    // increase the product quantity
    const updateProductQuantity = await Product.updateOne(
      { _id: product_id },
      { quantity: product.quantity + req.body.quantity },
      { runValidators: true }
    );
    let modifyMessage = "";
    if (updateProductQuantity?.modifiedCount < 1) {
      modifyMessage +=
        " - Something went wrong: Purchase is created but product couldn't be updated!";
    }

    res.status(201).json({
      error: false,
      message: "A new purchase is created!" + modifyMessage,
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
      "product_id",
      "brand_id",
      "firm_id",
      "user_id",
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
                - product_id should exist on products</br>
                - firm_id should exist on firms</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $product_id: '66b9fddcc29ab216e263b04f', 
                    $firm_id: '66b9fddcc29ab216e263b04f', 
                    $quantity: 150,
                    $price: 50,
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
                      </br>-product_id, firm_id, price, quantity fields are required!
                      </br> - Invalid param id, brand_id, firm_id, user_id, product_id type(ObjectId)!
                      </br> - Invalid quantity - it can\'t be less than 1!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Purchase not found!  
                      </br> - Product not found on products!
                      </br> - Brand not found on brands!
                      </br> - Firm not found on brands!
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

    const { product_id, firm_id, price, quantity } = req.body;

    if (!product_id || !firm_id || !price || !quantity) {
      throw new CustomError(
        "product_id, firm_id, price, quantity fields are required!",
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

    if (!mongoose.Types.ObjectId.isValid(firm_id)) {
      throw new CustomError("Invalid firm_id type(ObjectId)!", 400);
    }

    const firm = await Firm.findOne({ _id: firm_id });
    if (!firm) {
      throw new CustomError("Firm not found on firms!", 404);
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

    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }

    const oldQuantity = purchaseData?.quantity;

    //make main update at purchase->
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

    const updatedPurchase = await Purchase.findOne({ _id: req.params.id });

    const newQuantity = updatedPurchase?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (purchaseData?.product_id != product_id) {
      //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
      //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

      const oldProduct = await Product.findOne({
        _id: purchaseData?.product_id,
      });
      //delete old products quantity
      const oldProductUpdateQuantity = await Product.updateOne(
        { _id: purchaseData?.product_id },
        { quantity: oldProduct.quantity - oldQuantity },
        { runValidators: true }
      );

      if (oldProductUpdateQuantity?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is updated but old product couldn't be updated!";
      }
      //add quantity to new product
      const updateQuantityofProduct = await Product.updateOne(
        { _id: product_id },
        { quantity: product.quantity + updatedPurchase?.quantity }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is updated but new product couldn't be updated!";
      }
    } else {
      const updateQuantityofProduct = await Product.updateOne(
        { _id: product_id },
        { quantity: product.quantity + (newQuantity - oldQuantity) }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is created but product couldn't be updated!";
      }
    }

    res.status(202).json({
      error: false,
      message: "Purchase is updated!" + modifyMessage,
      result: updatedPurchase,
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Partially Update purchase"
            #swagger.description = `
                Partially Update a new purchase by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - product_id should exist on products</br> 
                - firm_id should exist on firms</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the product_id, firm_id, price, quantity field is required!",
                required:true,
                schema:{
                    product_id : '66b9fddcc29ab216e263b04f', 
                    firm_id: '66b9fddcc29ab216e263b04f', 
                    quantity: 150,
                    price: 50,

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
                      </br>- product_id or firm_id or price or quantity field is required!
                      </br>- Invalid param id, brand_id, firm_id, user_id, product_id type(ObjectId)!!
                      </br>- Invalid quantity - it can\'t be less than 1!
                      `
            }
            #swagger.responses[404] = {
            description:`Not found: 
                      </br>- Purchase not found! 
                          </br> - Product not found on products!
                          </br> - Brand not found on brands!
                          </br> - Firm not found on brands!
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

    const { product_id, firm_id, price, quantity } = req.body;

    if (!(product_id || firm_id || price || quantity)) {
      throw new CustomError(
        "product_id or firm_id or price or quantity field is required!",
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

    if (firm_id) {
      if (!mongoose.Types.ObjectId.isValid(firm_id)) {
        throw new CustomError("Invalid firm_id type(ObjectId)!", 400);
      }

      firm = await Firm.findOne({ _id: firm_id });
      if (!firm) {
        throw new CustomError("Firm not found on firms!", 404);
      }
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

    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }
    const oldQuantity = purchaseData?.quantity;

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

    const updatedPurchase = await Purchase.findOne({ _id: req.params.id });
    const oldProduct = await Product.findOne({
      _id: purchaseData?.product_id,
    });

    const newQuantity = updatedPurchase?.quantity;
    let modifyMessage = "";


    //update de product id degisirse -> yapialcak islemler neler olsun
    if (product_id) {
      // if product id is not null
      if (purchaseData?.product_id != product_id) {
        //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
        //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

        const oldProductUpdateQuantity = await Product.updateOne(
          { _id: purchaseData?.product_id },
          { quantity: oldProduct.quantity - oldQuantity },
          { runValidators: true }
        );

        if (oldProductUpdateQuantity?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but old product couldn't be updated!";
        }

        const updateQuantityofProduct = await Product.updateOne(
          { _id: product_id },
          { quantity: product.quantity + updatedPurchase?.quantity }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but new product couldn't be updated!";
        }


      } else {
        const updateQuantityofProduct = await Product.updateOne(
          { _id: product_id },
          { quantity: product.quantity + (newQuantity - oldQuantity) }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but product couldn't be updated!";
        }
      }
    } else {
      //if product_id is null
      const updateQuantityofProduct = await Product.updateOne(
        { _id: purchaseData?.product_id },
        { quantity: oldProduct.quantity + (newQuantity - oldQuantity) }
      );
      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is updated but product couldn't be updated!";
      }
    }

    res.status(202).json({
      error: false,
      message: "Purchase is partially updated!"+modifyMessage,
      result: updatedPurchase,
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
    
    const product = await Product.findOne({ _id: purchase?.product_id });
    
    // if(product?.quantity < purchase?.quantity){
    //   throw new CustomError(`Insufficient product quantity! - product quantity:${product?.quantity}, sale quantity :${quantity}`, 404);

    // }

    const { deletedCount } = await Purchase.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong! - asked record is found, but it couldn't be deleted!",
        500
      );
    }


    const deleteProductQuantity = await Product.updateOne(
      { _id: purchase?.product_id },
      { quantity: product?.quantity - purchase.quantity }
    );
    // let modifyMessage = "";
    //   if(deleteProductQuantity.modifiedCount< 1){
    //     modifyMessage = "Something went wrong: Purchase is deleted but product couldn't be updated!"
    //   }
    res.sendStatus(204);
  },
};
