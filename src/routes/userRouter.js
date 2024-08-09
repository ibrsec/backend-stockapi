"use strict";

const { user } = require("../controllers/userController");

const router = require("express").Router();
/* ------------------------------------ k ----------------------------------- */

router.route("/").get(user.list).post(user.create);

router
  .route("/:id")
  .get(user.read)
  .put(user.update)
  .patch(user.partialUpdate)
  .delete(user.delete);

/* ------------------------------------ k ----------------------------------- */
module.exports = router;
