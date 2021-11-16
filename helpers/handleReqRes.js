/*
title: handle request response
description: request response handler function
author: Rafat
date: 31/10/21
*/

//dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../route');
const { parseJSON } = require('./utilities');

//modelue scaffolding
const handler = {};

handler.handleReqRes = (req, res) =>{   
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const query = parsedUrl.query;
    const headerObj = req.headers;
    const decoder = new StringDecoder('utf8');
    let data = '';
    const requestedProperties = {
        parsedUrl,
        path,
        trimmedPath,
        query,
        method,
        headerObj
    };
    const choosenHandler = routes[trimmedPath] ? routes[trimmedPath] : routes['notFound'];

    req.on('data', (buffer)=>{
        data += decoder.write(buffer);
    })
    req.on('end', () => {
        data += decoder.end();
        requestedProperties.body = parseJSON(data);
        choosenHandler(requestedProperties, (statusCode, payload)=>{
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payload = typeof(payload) === 'object' ? payload : {};
    
            const stringifyPayload = JSON.stringify(payload);
    
            res.writeHead(statusCode);
            res.end(stringifyPayload);
        });
    });
}

//export the module
module.exports = handler;