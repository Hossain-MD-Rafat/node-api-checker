/*
title: user handler
description: user route request handle functions
author: Rafat
date: 03/11/21
*/

//dependencies
const crypto = require('crypto');
const choosenEnv = require('./enviornment');

//module scaffolding
const utilities = {};

//parse string to JSON object
utilities.parseJSON = (str) =>{
    let parsedStr;
    try{
        parsedStr = JSON.parse(str);
    }catch{
        parsedStr = {};
    }
    return parsedStr;
}

//hasing the password
utilities.hashPass = (str) =>{
    const hashedPass = crypto.createHmac('sha256', choosenEnv.secretKey)
    .update(str)
    .digest('hex');

    return hashedPass;
}

//token generator
utilities.tokenGenerator = (len) =>{
    const str = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = "";
    for(let i=0; i<len; i++){
        token += str.charAt(Math.floor(Math.random()*str.length));
    }
    return token;
}


// export module
module.exports = utilities;