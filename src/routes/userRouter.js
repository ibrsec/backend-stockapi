"use strict";


const router = require("express").Router();
const { user } = require("../controllers/userController");
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(user.list)
        .post(user.create);

router
  .route("/:id")
    .get(user.read)
    .put(user.update)
    .patch(user.partialUpdate)
    .delete(user.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
