/*
title: route handler
description: roting the request
author: Rafat
date: 30/10/21
*/

//dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleRoute.js');
const {userHandler} = require('./handlers/routeHandlers/user');
const {tokenHandler} = require('./handlers/routeHandlers/token');
const {notFoundHandler} = require('./handlers/routeHandlers/notFound.js');
const { checkHandler } = require('./handlers/routeHandlers/check.js');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
    notFound: notFoundHandler
}

module.exports = routes;