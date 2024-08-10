"use strict";
const crypto = require('node:crypto')

const passwordEncryptor = (password) => { 
  return crypto.pbkdf2Sync(password,process.env.SECRET_KEY,10000,32,'sha512').toString('hex');
}
module.exports = passwordEncryptor;