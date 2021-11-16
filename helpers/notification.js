/*
 * Title: Notifications Library
 * Description: Important functions to notify users
 * Author: Rafat
 * Date: 10/11/2021
*/

//dependecncies
const http = require('http');
const querystring = require('querystring');
const { twilio } = require('./enviornment');

//module scaffolding
const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) =>{
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg = typeof(msg) === 'string' && msg.length > 0 && msg.length < 1600 ? msg : false;

    if(userPhone && userMsg){
        const payload = {
            From: twilio.from,
            To: `+88${userPhone}`,
            Body: userMsg,
        }
        const stringifyPayload = querystring.stringify(payload);

        const options = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        const req = http.request(options, (res) =>{
            const status = res.statusCode;
            if(status === 200 || status === 301){
                callback(200, {
                    message: res
                })
            }else{
                callback(500, {
                    error: res
                })
            }
        })
        req.on('error', (e) =>{
            callback(500, {
                error: 'server error'
            })
        })
        req.write(stringifyPayload);
        req.end();
    }else{
        callback(400, {
            error: 'You have problem in your request'
        })
    }
}

//exports module
module.exports = notifications;