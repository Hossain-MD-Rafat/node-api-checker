/*
title: sample route handler
description: sample route request handle functions
author: Rafat
date: 31/10/21
*/

//module scaffolding object
const handler = {};

//sample handler function
handler.sampleHandler = (properties, callBack) =>{
    console.log(properties);

    callBack(200, {
        message: "This is sample"
    })
}

//module export
module.exports = handler;