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
router.use('/firms',require('./firmRouter'));
router.use('/categories',require('./categoryRouter'));
router.use('/brands',require('./brandRouter'));
router.use('/products',require('./productRouter'));
router.use('/purchases',require('./purchaseRouter'));
router.use('/sales',require('./saleRouter'));


 




/* ------------------------------------ c ----------------------------------- */
module.exports = router;