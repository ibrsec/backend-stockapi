"use strict";
const mongoose = require('mongoose');


const dbConnection = (req,res,next) => {

    mongoose.connect(process.env.CONNETION_STRING_MONGODB)
    .then((connect)=>{
        console.log('##### DB CONNECTED #####', connect.connection.host,connect.connection.name);

    })
    .catch((err)=>{
        console.log('#### DB NOT CONNECTED ##### : ',err);
    })

}

module.exports = {dbConnection,mongoose};