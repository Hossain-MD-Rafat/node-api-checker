/* 
title: Server checker
description: simple api checker node project
author: rafat
date: 30/10/21
*/

//dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

//module scaffolding
const app = {};

app.init = () =>{
    //start server
    server.init();

    //start worker
    worker.init();
}

app.init();

//exports the module
module.exports = app