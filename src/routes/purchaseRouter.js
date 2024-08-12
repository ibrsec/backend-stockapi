"use strict";


const router = require("express").Router();
const { purchase } = require("../controllers/purchaseController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, purchase.list)
        .post(permissions.isLogin, purchase.create);

router
  .route("/:id")
    .get(permissions.isLogin, purchase.read)
    .put(permissions.isLogin, purchase.update)
    .patch(permissions.isLogin, purchase.partialUpdate)
    .delete(permissions.isLogin, purchase.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
