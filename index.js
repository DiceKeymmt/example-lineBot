require('dotenv').config();

const http = require('http');
const https = require('https');
const crypto = require('crypto');

const sendRequestToAPIServer = require('./module_sendRequestToAPIServer').sendRequestToAPIServer;
const createMessageObj = require('./module_createMessageObj').createMessageObj;

//チャンネル基本設定
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
}

//ホットペッパーAPI_KEY
const apiKey = process.env.API_KEY

/**
 * 
 * ホットペッパーグルメサーチAPIのリクエストURL
 * 
 * https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=1
 * 
**/

const server = http.createServer();

server.on('request', (req, res) => {
    console.log(req.headers);
    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        const webhookEventObj = JSON.parse(body);
        sendRequestToAPIServer(webhookEventObj,`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=1`)
        .then( retVal => {
            console.log(JSON.stringify(createMessageObj(retVal,webhookEventObj)));
        });
    });

}).listen(process.env.PORT||8080);
