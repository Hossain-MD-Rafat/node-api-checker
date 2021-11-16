/*
title: crud file
description: functions to perform crud operation
author: Rafat
date: 31/10/12
*/

//dependencies
const fs = require('fs');

//module scaffolding
const crud = {};

let baseDir = __dirname;
//create database
crud.create = (dir, filename, data, callback) =>{
    fs.open(`${baseDir}/../.data/${dir}/${filename}.json`, 'wx', (err1, fileDescriptor)=>{
        if(!err1){
            data = JSON.stringify(data)
            fs.writeFile(fileDescriptor, data, (err2)=>{
                if(!err2){
                    fs.close(fileDescriptor, (err3)=>{
                        if(!err3){
                            callback(false)
                        }
                        else{
                            callback(err3)
                        }
                    })
                }
                else{
                    callback(err2)
                }
            })
        }
        else{
            callback(err1);
        }
    })
}
crud.read = (dir, filename, callback) => {
    fs.readFile(`${baseDir}/../.data/${dir}/${filename}.json`, 'utf8', (err, data)=>{
        callback(err, data);
    })
}
crud.update = (dir, filename, data, callback) => {
    fs.open(`${baseDir}/../.data/${dir}/${filename}.json`, 'w+', (err1, fd)=>{
        data = JSON.stringify(data);
        if(!err1){
            fs.writeFile(fd, data, (err2)=>{
                if(!err2){
                    fs.close(fd, (err3)=>{
                        if(!err3){
                            callback(false);
                        }
                        else{
                            callback(err3)
                        }
                    })
                }
                else{
                    callback(err2);
                }
            })
        } 
        else{
            callback(err1)
        }                     
    })
}
crud.delete = (dir, filename, callback) =>{
    fs.unlink(`${baseDir}/../.data/${dir}/${filename}.json`, (err)=>{
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    })
}
crud.dirFiles = (dir, callback) =>{
    fs.readdir(`${baseDir}/../.data/${dir}/`, (err, files) =>{
        if(!err && files.length > 0){
            const trimmedFile = [];
            files.forEach(file =>{
                trimmedFile.push(file.replace('.json', ''));
            })
            callback(false, trimmedFile);
        }else{
            callback(err);
        }
    })
}
//export the module
module.exports = crud;