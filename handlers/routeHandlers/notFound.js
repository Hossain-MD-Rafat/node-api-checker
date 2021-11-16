/*
title: not found pathname
description: not found request handle functions
author: Rafat
date: 31/10/2021
*/

//module scaffolding
const handler = {};

//not handler funtion
handler.notFoundHandler = (properties, callBack) =>{
    console.log(properties);
    callBack(404, {
        message: "The requested path does not match"
    })
}

//module exports
module.exports = handler;
