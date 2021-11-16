/* 
title: enviornment
description: enviornment variables
author: Rafat
date: 02/11/21
*/

// module scaffolding
const enviornment = {};

enviornment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'jhkjdfghjsrdy',
    maxChecks : 5,
    twilio: {
        from: '+15017122661',
        accountSid: 'ACa6e953a8ee5a6a053c569f5b025d705e',
        authToken: '4b6d1ac565f3979d03b3a6c5173223ba'
    }
}
enviornment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'wcvhbjnkouhd',
    maxChecks: 5,
    twilio: {
        from: '+15017122661',
        accountSid: 'ACa6e953a8ee5a6a053c569f5b025d705e',
        authToken: '4b6d1ac565f3979d03b3a6c5173223ba'
    }
}

//choosing the required enviornment
choosenEnv = typeof(process.env.ENV_NAME) === 'string' ? enviornment[process.env.ENV_NAME] : enviornment[staging];

//exports the module
module.exports = choosenEnv;
