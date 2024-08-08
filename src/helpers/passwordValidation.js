"use strict";

const passwordValidation = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/.test(password);
}

module.exports = passwordValidation;