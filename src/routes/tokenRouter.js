"use strict";


const router = require("express").Router();
const { token } = require("../controllers/tokenController");
const permissions = require('../middlewares/permissions');
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(permissions.isAdmin, token.list)
        .post(permissions.isAdmin, token.create);

router
  .route("/:id")
    .get(permissions.isAdmin, token.read)
    .put(permissions.isAdmin, token.update)
    .patch(permissions.isAdmin, token.partialUpdate)
    .delete(permissions.isAdmin, token.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
