"use strict";


const router = require("express").Router();
const { product } = require("../controllers/productController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, product.list)
        .post(permissions.isLogin, product.create);

router
  .route("/:id")
    .get(permissions.isLogin, product.read)
    .put(permissions.isLogin, product.update)
    .patch(permissions.isLogin, product.partialUpdate)
    .delete(permissions.isLogin, product.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
