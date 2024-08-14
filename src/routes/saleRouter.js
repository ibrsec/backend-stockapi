"use strict";


const router = require("express").Router();
const { sale } = require("../controllers/saleController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, sale.list)
        .post(permissions.isLogin, sale.create);

router
  .route("/:id")
    .get(permissions.isLogin, sale.read)
    .put(permissions.isLogin, sale.update)
    .patch(permissions.isLogin, sale.partialUpdate)
    .delete(permissions.isLogin, sale.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
