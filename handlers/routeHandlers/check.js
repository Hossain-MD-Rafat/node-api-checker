/*
title: check handler
description: check route request handle functions
author: Rafat
date: 07/11/21
*/
//dependencies
const { parseJSON, tokenGenerator } = require("../../helpers/utilities");
const crud = require("../../lib/crud");
const { _token } = require('./token');
const { maxChecks } = require('../../helpers/enviornment');

//module scaffolding
const handler = {};

handler.checkHandler = (requestedProperties, callback) => {
    const method = typeof(requestedProperties.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(requestedProperties.method) > -1 ? requestedProperties.method : false;
    if(method){
        handler._check[method](requestedProperties, callback);
    }
    else{
        callback(405, {
            error: 'Method is not allowed'
        })
    }
}

handler._check = {};

handler._check.post = (requestedProperties, callback) =>{
    const protocol = typeof(requestedProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol : false;

    const url = typeof(requestedProperties.body.url) === 'string' && requestedProperties.body.url.length > 0 ? requestedProperties.body.url : false;

    const method = typeof(requestedProperties.body.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(requestedProperties.body.method.toLowerCase()) > -1 ? requestedProperties.body.method.toLowerCase() : false;

    const successCode = typeof(requestedProperties.body.successCode) === 'object' && requestedProperties.body.successCode instanceof Array ? requestedProperties.body.successCode : false;

    const timeoutSecond = typeof(requestedProperties.body.timeoutSecond) === 'number' && requestedProperties.body.timeoutSecond % 1 === 0 && requestedProperties.body.timeoutSecond > 0 && requestedProperties.body.timeoutSecond < 6 ? requestedProperties.body.timeoutSecond : false;

    if(protocol && url && method && successCode && timeoutSecond){
        const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.trim().length === 20 ? requestedProperties.headerObj.token : false;

        if(token){
            crud.read('tokens', token, (err1, tData) =>{
                if(!err1 && tData){
                    const tokenData = parseJSON(tData);
                    const phone = tokenData.phone;
                    crud.read('users', phone, (err2, uData) =>{
                        if(!err2 && uData){
                            const userData = parseJSON(uData);
                            _token.verify(token, phone, (isValid) =>{
                                if(isValid){
                                    const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];

                                    if(userChecks.length < maxChecks){
                                        const checkId = tokenGenerator(20);
                                        const checkObj = {
                                            id : checkId,
                                            phone,
                                            protocol,
                                            url,
                                            method,
                                            successCode,
                                            timeoutSecond
                                        };
                                        crud.create('checks', checkId, checkObj, (err3) =>{
                                            if(!err3){
                                                userData.checks = userChecks;
                                                userData.checks.push(checkId);
                                                crud.update('users', phone , userData, (err4) =>{
                                                    if(!err4){
                                                        callback(200, {
                                                            message: 'New check has been created successfuly'
                                                        })
                                                    }else{
                                                        callback(500, {
                                                            error: 'Server side error to update user data'
                                                        })
                                                    }
                                                })
                                            }else{
                                                callback(500, {
                                                    error: 'Server error to write new check'
                                                })
                                            }
                                        })
                                    }else{
                                        callback(401, {
                                            error: 'User already exceed the max limit'
                                        })
                                    }
                                }else{
                                    callback(403, {
                                        error: 'Authentication failed'
                                    })
                                }
                            })
                        }else{
                            callback(500, {
                                error: 'Server error or user file not found'
                            })
                        }
                    })
                }else{
                    callback(500, {
                        error: 'Server error or token file not found'
                    })
                }
            })
        }else{
            callback(403, {
                error: 'Authentication problem.'
            })
        }
    }else{
        callback(400, {
            error: 'You have problem in your request.'
        })
    }
}
handler._check.get = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.trim().length === 20 ? requestedProperties.query.id : false;

    if(id){
        crud.read('checks', id, (err1, data) =>{
            if(!err1){
                const checkData = parseJSON(data);
                const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.trim().length === 20 ? requestedProperties.headerObj.token : false;
                _token.verify(token, checkData.phone, (isValid) =>{
                    if(isValid){
                        callback(200, checkData);
                    }else{
                        callback(403, {
                            error: 'Authentication problem'
                        })
                    }
                })
            }else{
                callback(500, {
                    error: 'Server error to read check file'
                })
            }
        })
    }else{
        callback(400, {
            error: 'You have problem in your request'
        })
    }
}
handler._check.put = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.trim().length === 20 ? requestedProperties.query.id : false;

    const protocol = typeof(requestedProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol : false;

    const url = typeof(requestedProperties.body.url) === 'string' && requestedProperties.body.url.length > 0 ? requestedProperties.body.url : false;

    const method = typeof(requestedProperties.body.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(requestedProperties.body.method.toLowerCase()) > -1 ? requestedProperties.body.method.toLowerCase() : false;

    const successCode = typeof(requestedProperties.body.successCode) === 'object' && requestedProperties.body.successCode instanceof Array ? requestedProperties.body.successCode : false;

    const timeoutSecond = typeof(requestedProperties.body.timeoutSecond) === 'number' && requestedProperties.body.timeoutSecond % 1 === 0 && requestedProperties.body.timeoutSecond > 0 && requestedProperties.body.timeoutSecond < 6 ? requestedProperties.body.timeoutSecond : false;

    if( id && (protocol || url || method || successCode || timeoutSecond)){
        crud.read('checks', id, (err1, data) =>{
            if(!err1){
                const checkData = parseJSON(data);
                const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.trim().length === 20 ? requestedProperties.headerObj.token : false;
                _token.verify(token, checkData.phone, (isValid) =>{
                    if(isValid){
                        if(protocol){
                            checkData.protocol = protocol;
                        }
                        if(url){
                            checkData.url = url;
                        }
                        if(method){
                            checkData.method = method;
                        }
                        if(successCode){
                            checkData.successCode = successCode;
                        }
                        if(timeoutSecond){
                            checkData.timeoutSecond = timeoutSecond;
                        }
                        crud.update('checks', id, checkData, (err2) =>{
                            if(!err2){
                                callback(200, {
                                    message: 'Check data updated successfully'
                                })
                            }else{
                                callback(500, {
                                    error: 'Problem to update data'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'Authentication error'
                        })
                    }
                })
            }else{
                callback(500, {
                    error: 'Problem to right the respective file'
                })
            }
        })
    }else{
        callback(400, {
            error: 'There is a problem in your request'
        })
    }
}
handler._check.delete = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.trim().length === 20 ? requestedProperties.query.id : false;

    if(id){
        crud.read('checks', id, (err1, data) =>{
            if(!err1 && data){
                const checkData = parseJSON(data);

                const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.trim().length === 20 ? requestedProperties.headerObj.token : false;

                _token.verify(token, checkData.phone, (isValid) =>{
                    if(isValid){
                        crud.read('users', checkData.phone, (err2, data1) =>{
                            if(!err2 && data1){
                                const userData = parseJSON(data1);
                                const userChecks = typeof userData.checks === 'object' &&userData.checks instanceof Array ? userData.checks : [];
                                const position = userChecks.indexOf(id);
                                if(position){
                                    userChecks.splice(position, 1);
                                    userData.checks = userChecks;
                                    crud.update('users', userData.phone, userData, (err3) =>{
                                        if(!err3){
                                            crud.delete('checks', id, (err4) =>{
                                                if(!err4){
                                                    callback(200, {
                                                        message: 'Successfully deleted'
                                                    })
                                                }else{
                                                    callback(500, {
                                                        error: 'Server problem to delete the file'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500, {
                                                error: 'Server problem to update user file'
                                            })
                                        }
                                    })
                                }else{
                                    callback(400, {
                                        error: 'You have problem in your request'
                                    })
                                }                              
                            }else{
                                callback(500, {
                                    error: 'Server error'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'Authentication problem'
                        })
                    }
                })
            }else{
                callback(404, {
                    error: 'The file is not found'
                })
            }
        })
    }else{
        callback(500, {
            error: 'There is a problem in your request'
        })
    }
}

//exporst the module
module.exports = handler;