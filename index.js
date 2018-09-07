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
    console.log(req.headers)
    let rowData = '';

    req.on('data', chunk => {
        rowData += chunk;
    })

    req.on('end', () => {
        if (!req.headers['x-line-signature']) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end(`404 Not Found
お探しのページは見つかりません。`)
        } else {
            const signature = crypto.createHmac('SHA256', config.channelSecret).update(rowData).digest('base64')

            if (req.headers['x-line-signature'] === signature) {
                console.log(typeof rowData)
                console.log(JSON.parse(rowData))
                res.end('owata')
            }
        }
    })
}).listen(process.env.PORT || 8080);