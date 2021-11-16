/* 
title: Server creation
description: create the server and start it
author: rafat
date: 30/10/21
*/

//dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const choosenEnv = require('../helpers/enviornment');

//app object - module scafolding
const server = {};

//create server
server.init = () =>{
    const serverInstance = http.createServer(server.handleReqRes);
    serverInstance.listen(choosenEnv.port,()=>{
        console.log(`The application is in ${choosenEnv.envName} mode`);
        console.log(`Listening to port ${choosenEnv.port}`);
    })
}

//request handle
server.handleReqRes = handleReqRes;



// export the module
module.exports = server;
