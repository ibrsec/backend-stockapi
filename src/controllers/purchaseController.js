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
      "productId",
      "brandId",
      "firmId",
      "userId",
    ]);
    res.status(200).json({
      error: false,
      message: "Purchases are listed!",
      details: await res.getModelListDetails(Purchase),
      data: purchases,
    });
  },
  create: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Create new purchase"
            #swagger.description = `
                Create a new purchase!</br></br>
                <b>Permission= Loginned User</b></br>   
                - productId should exist on products</br> 
                - firmId should exist on firms</br>
                 </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $productId : '66b9fddcc29ab216e263b04f', 
                    $firmId: '66b9fddcc29ab216e263b04f', 
                    $quantity: 150,
                    $price: 50,
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully created!',
            schema: { 
                error: false,
                message: "A new purchase is created!!",
                data:{$ref: '#/definitions/Purchase'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request:
                          </br> - productId, firmId, price, quantity fields are required!
                          </br> - Invalid brandId, firmId, userId, productId type(ObjectId)!
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
    const { productId, firmId, price, quantity } = req.body;

    if (!productId || !firmId || !price || !quantity) {
      throw new CustomError(
        "productId, firmId, price, quantity fields are required!",
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

    if (!mongoose.Types.ObjectId.isValid(firmId)) {
      throw new CustomError("Invalid firmId type(ObjectId)!", 400);
    }

    const firm = await Firm.findOne({ _id: firmId });
    if (!firm) {
      throw new CustomError("Firm not found on firms!", 404);
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

    const newPurchase = await Purchase.create(req.body);
    // increase the product quantity
    const updateProductQuantity = await Product.updateOne(
      { _id: productId },
      { $inc:{quantity: +req.body.quantity} },
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
      data: newPurchase,
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
                data:{$ref: '#/definitions/Purchase'} 
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
      "productId",
      "brandId",
      "firmId",
      "userId",
    ]);

    if (!purchase) {
      throw new CustomError("Purchase not found!", 404);
    }

    res.status(200).json({
      error: false,
      message: "Purchase is found!",
      data: purchase,
    });
  },
  update: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Update purchase"
            #swagger.description = `
                Update a new purchase by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - productId should exist on products</br>
                - firmId should exist on firms</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                required:true,
                schema:{
                    $productId: '66b9fddcc29ab216e263b04f', 
                    $firmId: '66b9fddcc29ab216e263b04f', 
                    $quantity: 150,
                    $price: 50,
                }
            }
            #swagger.responses[201] = {
            description: 'Successfully updated!',
            schema: { 
                error: false,
                message:  "Purchase is updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Purchase'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>-productId, firmId, price, quantity fields are required!
                      </br> - Invalid param id, brandId, firmId, userId, productId type(ObjectId)!
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

    const { productId, firmId, price, quantity } = req.body;

    if (!productId || !firmId || !price || !quantity) {
      throw new CustomError(
        "productId, firmId, price, quantity fields are required!",
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

    if (!mongoose.Types.ObjectId.isValid(firmId)) {
      throw new CustomError("Invalid firmId type(ObjectId)!", 400);
    }

    const firm = await Firm.findOne({ _id: firmId });
    if (!firm) {
      throw new CustomError("Firm not found on firms!", 404);
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

    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }

    const oldQuantity = purchaseData?.quantity;

    //make main update at purchase->
    const data = await Purchase.updateOne(
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

    const updatedPurchase = await Purchase.findOne({ _id: req.params.id });

    const newQuantity = updatedPurchase?.quantity;
    let modifyMessage = "";

    //update de product id degisirse -> yapialcak islemler neler olsun
    if (purchaseData?.productId != productId) {
      //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
      //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

      const oldProduct = await Product.findOne({
        _id: purchaseData?.productId,
      });
      //delete old products quantity
      const oldProductUpdateQuantity = await Product.updateOne(
        { _id: purchaseData?.productId },
        { quantity: oldProduct.quantity - oldQuantity },
        { runValidators: true }
      );

      if (oldProductUpdateQuantity?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is updated but old product couldn't be updated!";
      }
      //add quantity to new product
      const updateQuantityofProduct = await Product.updateOne(
        { _id: productId },
        { quantity: product.quantity + updatedPurchase?.quantity }
      );

      if (updateQuantityofProduct?.modifiedCount < 1) {
        modifyMessage +=
          " - Something went wrong: Purchase is updated but new product couldn't be updated!";
      }
    } else {
      const updateQuantityofProduct = await Product.updateOne(
        { _id: productId },
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
      data,
      new: updatedPurchase,
    });
  },
  partialUpdate: async (req, res) => {
    /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Partially Update purchase"
            #swagger.description = `
                Partially Update a new purchase by id!</br></br>
                <b>Permission= Loginned User</b></br>  
                - productId should exist on products</br> 
                - firmId should exist on firms</br>
                  </br>
            `
            #swagger.parameters['body']={
                in:'body',
                description:"At least one of the productId, firmId, price, quantity field is required!",
                required:true,
                schema:{
                    productId : '66b9fddcc29ab216e263b04f', 
                    firmId: '66b9fddcc29ab216e263b04f', 
                    quantity: 150,
                    price: 50,

                }
            }
            #swagger.responses[201] = {
            description: 'Successfully partially updated!',
            schema: { 
                error: false,
                message: "Purchase is partially updated!!",
                data:{modifiedCount:1},
                new:{$ref: '#/definitions/Purchase'} 
            }

        }  
            #swagger.responses[400] = {
            description:`Bad request: 
                      </br>- productId or firmId or price or quantity field is required!
                      </br>- Invalid param id, brandId, firmId, userId, productId type(ObjectId)!!
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

    const { productId, firmId, price, quantity } = req.body;

    if (!(productId || firmId || price || quantity)) {
      throw new CustomError(
        "productId or firmId or price or quantity field is required!",
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

    if (firmId) {
      if (!mongoose.Types.ObjectId.isValid(firmId)) {
        throw new CustomError("Invalid firmId type(ObjectId)!", 400);
      }

      firm = await Firm.findOne({ _id: firmId });
      if (!firm) {
        throw new CustomError("Firm not found on firms!", 404);
      }
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

    const purchaseData = await Purchase.findOne({ _id: req.params.id });
    if (!purchaseData) {
      throw new CustomError("Purchase not found", 404);
    }
    const oldQuantity = purchaseData?.quantity;

    //main update
    const data = await Purchase.updateOne(
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

    const updatedPurchase = await Purchase.findOne({ _id: req.params.id });
    const oldProduct = await Product.findOne({
      _id: purchaseData?.productId,
    });

    const newQuantity = updatedPurchase?.quantity;
    let modifyMessage = "";


    //update de product id degisirse -> yapialcak islemler neler olsun
    if (productId) {
      // if product id is not null
      if (purchaseData?.productId != productId) {
        //product id degisirseek eski olandan quantity cikarilacak yeni olana eklenecek
        //quantityde degisirse eski quantity eski productan cikacak, yeni quantity yeni producta eklenecek!

        const oldProductUpdateQuantity = await Product.updateOne(
          { _id: purchaseData?.productId },
          { quantity: oldProduct.quantity - oldQuantity },
          { runValidators: true }
        );

        if (oldProductUpdateQuantity?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but old product couldn't be updated!";
        }

        const updateQuantityofProduct = await Product.updateOne(
          { _id: productId },
          { quantity: product.quantity + updatedPurchase?.quantity }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but new product couldn't be updated!";
        }


      } else {
        const updateQuantityofProduct = await Product.updateOne(
          { _id: productId },
          { quantity: product.quantity + (newQuantity - oldQuantity) }
        );
        if (updateQuantityofProduct?.modifiedCount < 1) {
          modifyMessage +=
            " - Something went wrong: Purchase is updated but product couldn't be updated!";
        }
      }
    } else {
      //if productId is null
      const updateQuantityofProduct = await Product.updateOne(
        { _id: purchaseData?.productId },
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
      data,
      new: updatedPurchase,
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
    
    const product = await Product.findOne({ _id: purchase?.productId });
    
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
      { _id: purchase?.productId },
      { quantity: product?.quantity - purchase.quantity }
    );
    // let modifyMessage = "";
    //   if(deleteProductQuantity.modifiedCount< 1){
    //     modifyMessage = "Something went wrong: Purchase is deleted but product couldn't be updated!"
    //   }
    res.sendStatus(204);
  },
};
