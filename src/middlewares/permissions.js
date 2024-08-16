"use strict"

const CustomError = require("../errors/customError")

    /* -------------------------------------------------------------------------- */
    /*                                 PERMISSIONS                                */
    /* -------------------------------------------------------------------------- */


module.exports = {
    isLogin : (req,res,next)=> {
        if(!req?.user ){
            throw new CustomError('Forbidden - You must login first!',403)
        }
        if(!req.user?.isActive){
            req.user = null;
            throw new CustomError('Forbidden - Your account is not active please contact with the support!',401)
        }
        
        next()

        
    },
    isAdmin: (req,res,next)=> {
        if(!req.user?.isAdmin){
            throw new CustomError('Forbidden - You must login as admin user!')
        }
        
        if(!req.user?.isActive){
            req.user = null;
            throw new CustomError('Forbidden - Your account is not active please contact with the support!',401)
        }
        next();

        
    },
    isAdminOrStaff: (req,res,next)=> {
        if((!req.user?.isAdmin || req.user?.isStaff)){
            throw new CustomError('Forbidden - You must login as admin or staff user!')
        }
        
        if(!req.user?.isActive){
            req.user = null;
            throw new CustomError('Forbidden - Your account is not active please contact with the support!',401)
        }
        next();
        
    }
}