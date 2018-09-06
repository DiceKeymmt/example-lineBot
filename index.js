require('dotenv').config();

const http = require('http');
const https = require('https');
const crypto = require('crypto');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
}

const options = {
    protocol: 'https:',
    host: 'api.line.me',
    port: 443,
    method: 'POST',
    path: '/v2/bot/message/reply',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.channelAccessToken}`
    }
}

const test = {
    protocol: 'https:',
    host: 'http-server-test.herokuapp.com',
    port: 443,
    method: 'POST',
    path: '/webhook',
    headers: {
        'Content-Type': 'application/json',
    }
}

const data = {
    replyToken: '',
    messages: [{
        type: 'text',
        text: 'Hello World!'
    }]
}

const server = http.createServer();

const client = https.request(test);

server.on('request', (req,res) => {
    console.log(client)
    res.end()
}).listen(process.env.PORT||8080)