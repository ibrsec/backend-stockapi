"use strict";


const router = require("express").Router();
const { category } = require("../controllers/categoryController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, category.list)
        .post(permissions.isLogin, category.create);

router
  .route("/:id")
    .get(permissions.isLogin, category.read)
    .put(permissions.isLogin, category.update)
    .patch(permissions.isLogin, category.partialUpdate)
    .delete(permissions.isLogin, category.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
