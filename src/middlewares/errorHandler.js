"use strict";

module.exports = (err,req,res,next)=>{
    const statusCode = err?.statusCode || res.errorStatusCode || 500;
    if(process.env.NODE_ENV === 'dev'){
        console.log(err);
    }
    res.status(statusCode).json({
        error:true,
        message:err.message,
        errorBody: req.body,
        stack:err.stack,
    })



}