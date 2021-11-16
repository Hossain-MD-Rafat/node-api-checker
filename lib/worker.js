/* 
title: worker creation
description: create the worker file and make function for worker
author: rafat
date: 11/11/21
*/
//dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require("../helpers/utilities");
const crud = require("./crud");
const { sendTwilioSms } = require('../helpers/notification');

//module scaffolding
const worker = {};

//gather all the available checks
worker.gatherFiles = () =>{
    crud.dirFiles('checks', (err1, fileNames) =>{
        if(!err1 && fileNames){
            fileNames.forEach(fileName => {
                crud.read('checks', fileName, (err2, check) =>{
                    if(!err2 && check){
                        worker.validateCheckData(parseJSON(check));
                    }else{
                        console.log('Cannot find the checkfile');
                    }
                })
            });
        }else{
            console.log('Problem to reading files in checks directory');
        }
    })
}

//validate check data with state and lastcheck variable
worker.validateCheckData = (check) =>{
    if(check && check.id){
        const state = typeof(check.state) === 'string' && ['up', 'down'].indexOf(check.state) > -1 ? check.state : 'down';
        const lastCheck = typeof(check.lastCheck) === 'number' &&  check.lastCheck > 0 ? check.lastCheck : false;

        check.state = state;
        check.lastCheck = lastCheck;

        worker.performCheck(check);
    }else{
        console.log('Invalid check data');
    }
}

//perform the request operation to find out the status of check
worker.performCheck = (check) =>{
    //initial check outcome
    const checkOutcome = {
        error: false,
        responseCode: false
    };
    let outcomeSent = false;

    const parsedUrl = url.parse(`${check.protocol}://${check.url}`);
    const checkTimeOut = check.timeoutSeconds && typeof(check.timeoutSeconds) === 'number' && check.timeoutSeconds > -1 ? check.timeoutSeconds : 0;
    const reqDetails = {
        protocol: `${check.protocol}:`,
        hostname: parsedUrl.hostname,
        method: check.method.toUpperCase(),
        path: parsedUrl.path,
        timeout: checkTimeOut * 1000,
    }
    const protocolToUse = check.protocol === 'http' ? http : https;
    const req = protocolToUse.request(reqDetails, (res) =>{
        const status = res.statusCode;
        checkOutcome.responseCode = status;

        if(!outcomeSent){
            worker.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    });
    req.on('error', (e) =>{
        checkOutcome = {
            error: true,
            value: e
        }
        if(!outcomeSent){
            worker.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    });
    req.on('timeout', () =>{
        checkOutcome = {
            error: true,
            value: 'timeout'
        }
        if(!outcomeSent){
            worker.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    })
    req.end();
}

//process checkout data to send a alert
worker.processCheckOutcome = (checkData, checkOutcome) =>{
    const state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCode.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    const alert = checkData.lastCheck && state != checkData.state ? true : false;

    checkData.state = state;
    checkData.lastCheck = Date.now();

    crud.update('checks', checkData.id, checkData, (err) =>{
        if(!err){
            if(alert){
                worker.sendAlert(checkData);
            }else{
                console.log('Alert is not needed as state is same as previous');
            }
        }else{
            console.log("Error occured to save the data");
        }
    })
}

//send the alert sms to client
worker.sendAlert = (checkData) =>{
    const msg = `Alert: Your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${checkData.state}`;

    sendTwilioSms(checkData.phone, msg, (resCode, err) =>{
        console.log(msg);
    })
}

worker.loop = () =>{
    setInterval(() => {
        worker.gatherFiles();
    }, 1000 * 60);
}

worker.init = () =>{
    worker.gatherFiles();

    worker.loop();
}

// exports the module
module.exports = worker