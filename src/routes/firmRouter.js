"use strict";


const router = require("express").Router();
const { firm } = require("../controllers/firmController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isLogin, firm.list)
        .post(permissions.isLogin, firm.create);

router
  .route("/:id")
    .get(permissions.isLogin, firm.read)
    .put(permissions.isLogin, firm.update)
    .patch(permissions.isLogin, firm.partialUpdate)
    .delete(permissions.isLogin, firm.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
