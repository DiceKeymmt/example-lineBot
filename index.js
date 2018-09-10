require('dotenv').config();

const http = require('http');
const https = require('https');
const crypto = require('crypto');

const client = require('./getShopInfo').client

const apiKey = process.env.API_KEY

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
    port: process.env.PORT
}

let options = {
    protocol: 'https:',
    host: 'api.line.me',
    method: 'POST',
    path: '/v2/bot/message/reply',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
        'Authorization': `Bearer ${config.channelAccessToken}`
    }
}

const server = http.createServer();

//url // http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3

const DataTransmissionToMessageAPI = (replyData) => {
    const options = {
        protocol: 'https:',
        host: 'api.line.me',
        method: 'POST',
        path: '/v2/bot/message/reply',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(replyData).length.toString(),
            'Authorization': `Bearer ${config.channelAccessToken}`
        }
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body)
            })
        }).on('error', err => {
            reject(err)
        });

        req.write(JSON.stringify(replyData));
        req.end()
    });
}

server.on('request', (req, res) => {
    if (req.url !== '/webhook' || req.method !== 'POST') {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end(`404 Not Found`)
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        if (body === '') {
            throw "bodyに値を存在しません。"
        }

        const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
        const webhookEventObj = JSON.parse(body);

        if (!req.headers['x-line-signature'] === signature) {
            throw "Signatureの値を不正です。"
        }

        switch (webhookEventObj.events[0].message.type) {
            case 'text':
                const replyData = {
                    replyToken: webhookEventObj.events[0].replyData,
                    messages: [{
                        type: 'text',
                        text: webhookEventObj.events[0].message.text
                    }]
                }

                DataTransmissionToMessageAPI(replyData)
                    .then(d => {
                        console.log(d)
                    })
                    .catch(e => {
                        console.log(e)
                    });

                break;

            default:
                const replyData = {
                    replyToken: webhookEventObj.events[0].replyData,
                    messages: [{
                        type: 'text',
                        text: '不正なメッセージです。'
                    }]
                }

                DataTransmissionToMessageAPI(replyData)
                    .then(d => {
                        console.log(d)
                    })
                    .catch(e => {
                        console.log(e)
                    });

                break;

        }
    })
    res.end('owata');
}).listen(config.port||8080);