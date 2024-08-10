"use strict";


const router = require("express").Router();
const { token } = require("../controllers/tokenController");
/* ------------------------------------ k ----------------------------------- */

router
    .route("/")
        .get(token.list)
        .post(token.create);

router
  .route("/:id")
    .get(token.read)
    .put(token.update)
    .patch(token.partialUpdate)
    .delete(token.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
