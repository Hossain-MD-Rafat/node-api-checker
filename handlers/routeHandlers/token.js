/*
title: user handler
description: user route request handle functions
author: Rafat
date: 04/11/21
*/

//dependencies
const { parseJSON, hashPass, tokenGenerator } = require('../../helpers/utilities');
const crud = require('../../lib/crud');

//module scaffolding
const handler = {}

handler.tokenHandler = (requestedProperties, callback) =>{
    const reqMethod = ['post', 'get', 'put', 'delete'];
    choosenMethod = reqMethod.indexOf(requestedProperties.method) > -1 ? requestedProperties.method : false;
    if(choosenMethod){
        handler._token[choosenMethod](requestedProperties, callback);
    }
    else{
        callback(405, {
            error: 'Invalid request'
        })
    }

}

//token object to handle request
handler._token = {}

handler._token.post = (requestedProperties, callback) =>{
    const data = requestedProperties.body;
    const phone = typeof(data.phone) === 'string' && data.phone.trim().length === 11 ? data.phone : false;
    const password = typeof(data.password) === 'string' && data.password.trim().length > 0 ? data.password : false;
    if(phone && password){
        crud.read('users', phone, (err, userData) =>{
            if(!err && userData){
                const user = parseJSON(userData);
                if(user.password === hashPass(password)){
                    const tokenId = tokenGenerator(20);
                    const expires = Date.now() + 60*60*1000;
                    const tokenObj = {
                        phone,
                        id: tokenId,
                        expires
                    }
                    crud.create('tokens', tokenId, tokenObj, (err) =>{
                        if(!err){
                            callback(200,{
                                message: 'The token has been created'
                            })
                        }else{
                            callback(500, {
                                error: 'Server side error'
                            })
                        }
                    })
                }else{
                    callback(400, {
                        error: 'Invaliddddd request'
                    })
                }
            }
            else{
                callback(404, {
                    error: 'You are not registered yet'
                })
            }
        })
    }


}
handler._token.get = (requestedProperties, callback) =>{
    const token = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.length === 20 ? requestedProperties.query.id : false;

    if(token){
        crud.read('tokens', token, (err, data) =>{
            if(!err && data){
                tokenData = parseJSON(data);
                callback(200, tokenData);
            }
            else{
                callback(500, {
                    error: 'Server side error.'
                })
            }
        })
    }else{
        callback(404, {
            error: 'Not found'
        })
    }

}
handler._token.put = (requestedProperties, callback) =>{
    const token = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.length === 20 ? requestedProperties.query.id : false;
    
    const extend = typeof(requestedProperties.body.extend) === 'boolean' ? requestedProperties.body.extend : false;
    if(token && extend){
        crud.read('tokens', token, (err1, data) =>{
            if(!err1 && data){
                tokenData = parseJSON(data);
                if(tokenData.expires>=Date.now()){
                    tokenData.expires = Date.now() + 60*60*1000;
                    crud.update('tokens', token, tokenData, (err2) =>{
                        if(!err2){
                            callback(200, {
                                message: 'The requested has been updated.'
                            })
                        }else{
                            callback(500, {
                                error: 'Server side error.'
                            })
                        }
                    })
                }else{
                    callback(400, {
                        error: 'Token has already been expired.'
                    })
                }
            }else{
                callback(404, {
                    error: 'Not found.'
                })
            }
        })
    }else{
        callback(400, {
            error: 'There is a problem in your request.'
        })
    }
}
handler._token.delete = (requestedProperties, callback) =>{
    const token = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.length === 20 ? requestedProperties.query.id : false;

    if(token){
        crud.read('tokens', token, (err1, data) =>{
            if(!err1 && data){
                crud.delete('tokens', token, (err2) =>{
                    if(!err2){
                        callback(200, {
                            message: 'The requested file has been deleted.'
                        })
                    }else{
                        callback(500, {
                            error: 'Server error.'
                        })
                    }
                })
            }else{
                callback(404, {
                    error: 'The file doesn\'t exist.'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Invalid request.'
        })
    }
}
handler._token.verify = (token, phone, callback) =>{
    const tokenId = typeof(token) === 'string' && token.length > 0 ? token : false;
    const tokenPhone = typeof(phone) === 'string' && phone.length === 11 ? phone : false;
    if(tokenId && tokenPhone){
        crud.read('tokens', tokenId, (err, data) =>{
            if(!err && data){
                tokenData = parseJSON(data);
                if(tokenData.phone === tokenPhone && tokenData.expires > Date.now()){
                    callback(true);
                }else{
                    callback(false);
                }
            }else{
                callback(false);
            }
        })
    }else{
        callback(false);
    }
}

//module export
module.exports = handler