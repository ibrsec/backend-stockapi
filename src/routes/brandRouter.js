"use strict";


const router = require("express").Router();
const { brand } = require("../controllers/brandController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, brand.list)
        .post(permissions.isLogin, brand.create);

router
  .route("/:id")
    .get(permissions.isLogin, brand.read)
    .put(permissions.isLogin, brand.update)
    .patch(permissions.isLogin, brand.partialUpdate)
    .delete(permissions.isLogin, brand.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
