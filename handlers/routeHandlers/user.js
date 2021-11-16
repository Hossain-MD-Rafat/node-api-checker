/*
title: user handler
description: user route request handle functions
author: Rafat
date: 02/11/21
*/

//dependencies
const { hashPass, parseJSON } = require("../../helpers/utilities");
const crud = require("../../lib/crud");
const {_token} = require('./token');

//module scaffolding
const handler = {};
handler.userHandler = (requestedProperties, callback) =>{
    const reqMethod = ['post', 'get', 'put', 'delete'];
    if(reqMethod.indexOf(requestedProperties.method) > -1){
        handler._user[requestedProperties.method](requestedProperties, callback);
    }
    else{
        callback(405);
    }
}

handler._user = {};

handler._user.post = (requestedProperties, callback) =>{
    const data = requestedProperties.body;
    const firstName = typeof(data.firstName) === 'string' && data.firstName.trim().length > 0 ? data.firstName : false;

    const lastName = typeof(data.lastName) === 'string' && data.lastName.trim().length > 0 ? data.lastName : false;

    const phone = typeof(data.phone) === 'string' && data.phone.trim().length === 11 ? data.phone : false;

    const password = typeof(data.password) === 'string' && data.password.trim().length > 0 ? data.password : false;

    const tos = typeof(data.tos) === 'boolean' ? data.tos: false;
    
    if(firstName && lastName && phone && password && tos){
        const userObj = {
            firstName,
            lastName,
            phone,
            password: hashPass(password),
            tos
        }
        crud.read('users', phone, (err1) =>{
            if(err1){
                crud.create('users', phone, userObj, (err2)=>{
                    if(!err2){
                        callback(200, {
                            message: 'An user has been created'
                        })
                    }
                    else{
                        callback(500, {
                            message: 'There is a problem creating new user'
                        })
                    }
                })
            }
            else{
                callback(500, {
                    message: 'The file already exists'
                })
            }
        })
    }
    else{
        callback(400, {
            message: 'Please provide all the neccessary information'
        })
    }
}

handler._user.get = (requestedProperties, callback) =>{
    const queryStr = requestedProperties.query.phone;
    const phone = typeof(queryStr) === 'string' && queryStr.trim().length === 11 ? queryStr : false;

    const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.length > 0 ? requestedProperties.headerObj.token : false;

    if(phone){
        _token.verify(token, phone, (isValid) =>{
            if(isValid){
                crud.read('users', phone, (err, user)=>{
                    const userData = parseJSON(user);
                    if(!err){
                        callback(200, userData);
                    }else{
                        callback(404, {
                            error: 'The user was not found'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Authentication problem'
                })
            }
        })
    }
    else{
        callback(400, {
            error: 'There is a problem in your request'
        })
    }
}

handler._user.put = (requestedProperties, callback) =>{
    const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.length > 0 ? requestedProperties.headerObj.token : false;

    const queryStr = requestedProperties.query.phone;
    const data = requestedProperties.body;

    const firstName = typeof(data.firstName) === 'string' && data.firstName.trim().length > 0 ? data.firstName : false;

    const lastName = typeof(data.lastName) === 'string' && data.lastName.trim().length > 0 ? data.lastName : false;

    const phone = typeof(queryStr) === 'string' && queryStr.trim().length === 11 ? queryStr : false;

    const password = typeof(data.password) === 'string' && data.password.trim().length > 0 ? data.password : false;
    //console.log(lastName, firstName, password)
    if(phone){
        if(lastName || firstName || password){
            _token.verify(token, phone, (isValid) =>{
                if(isValid){
                    crud.read('users', phone, (err, userData) =>{
                        if(!err){
                            const user = parseJSON(userData);
                    if(firstName){
                        user.firstName = firstName;
                    }
                    if(lastName){
                        user.lastName = lastName;
                    }
                    if(password){
                        pass = hashPass(password);
                        user.password = pass;
                    }

                    crud.update('users', phone, user, (err) =>{
                        if(!err){
                            callback(200, {
                                message: 'User information Updated'
                            })
                        }
                        else{
                            callback(500, {
                                error: err
                            })
                        }
                    })
                }
                else{
                    callback(500, {
                        error: 'The file doesnot exist'
                    })
                }
            })
                }else{
                    callback(403, {
                        error: 'Authentication problem'
                    })
                }
            })
        }
        else{
            callback(400, {
                error: 'There is a problem in your request'
            })
        }
    }
    else{
        callback(400, {
            error: 'There is a problem in your request'
        })
    }
}

handler._user.delete = (requestedProperties, callback) =>{
    const queryStr = requestedProperties.query.phone;
    const phone = typeof(queryStr) === 'string' && queryStr.trim().length === 11 ? queryStr : false;

    const token = typeof(requestedProperties.headerObj.token) === 'string' && requestedProperties.headerObj.token.length > 0 ? requestedProperties.headerObj.token : false;

    if(phone){
        _token.verify(token, phone, (isValid) =>{
            if(isValid){
                crud.read('users', phone, (err1) =>{
                    if(!err1){
                        crud.delete('users', phone, (err2) =>{
                            if(!err2){
                                callback(200, {
                                    message: 'The file has been deleted'
                                })
                            }else{
                                callback(500, {
                                    error: 'Server side error'
                                })
                            }
                        })
                    }else{
                        callback(500, {
                            error: 'Invalid request'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Authentication problem'
                })
            }
        })
    }
    else{
        callback(400, {
            message: 'There is a problem in your request'
        })
    }

}

//exports module
module.exports = handler;