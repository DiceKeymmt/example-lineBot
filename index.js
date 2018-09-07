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

const data = {
    replyToken: '',
    messages: [{
        type: 'text',
        text: 'Hello World!'
    }]
}

const server = http.createServer();

server.on('request', (req, res) => {
    if (req.url !== '/webhook' || req.method !== 'POST') {
        res.writeHead(404, {'Content-Type':'text/plain'})
        res.end(`404
Not Found`)
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        if (body === '') {
            console.log('bodyが空です。');
            return
        }

        data.replyToken = JSON.parse(body).events[0].replyToken;
        const d = JSON.stringify(data);

        const _req = https.request(options, res => {
            res.on('data', chunk => {});
            
            res.on('end', () => {});
        });

        _req.on('error', err => {
            console.log(err)
        });

        _req.write(d)

        _req.end()

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('success');
        
    })
}).listen(process.env.PORT||8080)