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

const client = https.request(test, res => {
    res.on('data', chunk => {
        console.log(`chunk`)
    })

    res.on('end', () => {
        console.log('POST owata')
    })
})

client.on('error', err => {
    console.log(err)
})

server.on('request', (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk
    });

    req.on('end', () => {
        client.write(JSON.stringify(data))
        client.end()
        res.end('owata')
    });
}).listen(process.env.PORT||8080)