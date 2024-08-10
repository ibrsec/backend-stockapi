"use strict";

/* -------------------------------------------------------------------------- */
/*                                 Main Routes                                */
/* -------------------------------------------------------------------------- */



/* ------------------------------------ imports ----------------------------------- */

const router = require('express').Router();



/* ------------------------------------ routes ----------------------------------- */

//Routes
router.use('/documents',require('./documentRouter'));
router.use('/users',require('./userRouter'));
router.use('/tokens',require('./tokenRouter'));
router.use('/auth',require('./authRouter'));


 




/* ------------------------------------ c ----------------------------------- */
module.exports = router;