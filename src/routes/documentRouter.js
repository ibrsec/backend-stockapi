"use strict";


const router = require('express').Router();
const swaggerUI = require('swagger-ui-express');
const redoc = require('redoc-express')
const swaggerJson = require('../configs/swagger.json');


router.all('/',(req,res)=>{
    res.json({
        documents: {
            json: '/documents/json',
            swagger:'/documents/swagger',
            redoc:'/documents/redoc',
        }
    })
})
router.use('/json',(req,res)=>{
    res.sendFile('/src/configs/swagger.json', {root:'.'})
})

router.use('/swagger',swaggerUI.serve, swaggerUI.setup(swaggerJson,{swaggerOptions:{persistAuthorization:true}}));
router.use('/redoc', redoc({specUrl:'/documents/json', title:'Stock api Redoc Api doc'}))








module.exports = router;