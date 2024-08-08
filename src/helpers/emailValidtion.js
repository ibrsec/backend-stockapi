"use strict";

const emailValidtion = (email) => {
    return /.+@.+\..+/.test(email);
}

module.exports = emailValidtion;