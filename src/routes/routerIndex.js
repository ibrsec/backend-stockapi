"use strict";

/* -------------------------------------------------------------------------- */
/*                                 Main Routes                                */
/* -------------------------------------------------------------------------- */



/* ------------------------------------ imports ----------------------------------- */
const express = require('express');
const router = express.Router();
const path = require("node:path");



/* ------------------------------------ routes ----------------------------------- */

//welcome route
router.all('/',(req,res)=>{
    res.json({
        message:"Welcome to Stock api!"
        ,documents:[
            '/documents/json',
            '/documents/swagger',
            '/documents/redoc',
        ]
    })
})



// swagger static
router.use(
    "/swagger",
    express.static(path.join(__dirname, "node_modules", "swagger-ui-dist"))
  );

//documents
router.use('/documents',require('./documentRouter'));


 
//not found route
router.use('*',(req,res)=>{
res.errorStatusCode = 400;
throw new Error('route not found!')
})




/* ------------------------------------ c ----------------------------------- */
module.exports = router;