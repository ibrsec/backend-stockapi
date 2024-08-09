"use strict";

const {User} = require('../models/userModel');



module.exports.user = {
    list:async(req,res)=> {
        /*
          #swagger.tags = ['Users']
          #swagger.summary = List users
          #swagger.description = `
                                   List all users</br>
                                   - Normal users can't list staff or admin users</br>
                                   - Staff users can't list admin users</br></br>
                                   <b>Permission= Loginned user</b></br></br></br>
                                   You can send query with endpoint for search[], sort[], page and limit.
                                        <ul> Examples:
                                            <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                                            <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                                            <li>URL/?<b>page=2&limit=1</b></li>
                                        </ul>
          `
         */
       


        //restrict listing user to non admin users = they wont see the admins

        const customFilters = {is_admin:false,is_staff:false};
        if(req.user?.is_admin){
            customFilters = {};
        }else if(req?.user?.is_staff){
            customFilters = {is_admin:false,is_staff:true};
        }


        const users = await res.getModelList(User /* ,customfilters */);
        res.status(200).json({
            error:false,
            message:'Users are listed!',
            result: users
        })
    },
    create:async(req,res)=> {},
    read:async(req,res)=> {},
    update:async(req,res)=> {},
    partialUpdate:async(req,res)=> {},
    delete:async(req,res)=> {},
}