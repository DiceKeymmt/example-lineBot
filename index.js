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

server.on('request', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        if (body === '') {
            console.log('bodyが空です。');
            return
        }

        console.log(body)
        
        const signature = crypto.createHmac('SHA256', config.channelSecret).update(body).digest('base64');
        if (req.headers['x-line-signature'] === signature) {
            const webhookEventObj = JSON.parse(body);

            const data = (() => {
                if (webhookEventObj.events[0].message.type === 'text') {
                    return {
                        replyToken: webhookEventObj.events[0].replyToken,
                        messages: [{
                            type: 'text',
                            text: webhookEventObj.events[0].message.text
                        }]
                    } 
                } else if (webhookEventObj.events[0].message.type === 'location') {
                    client(`http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3`)
                        .then( data => {
                            return {
                                replyToken: webhookEventObj.events[0].replyToken,
                                messages: [{
                                    type: 'text',
                                    text: data.results.shop[0].name
                                },
                                {
                                    type: 'text',
                                    text: data.results.shop[0].address
                                }
                            ]
                            } 
                        })

                    console.log('promise')
                } else {
                    return {
                        replyToken: webhookEventObj.events[0].replyToken,
                        messages: [{
                            type: 'text',
                            text: '値が無効です。'
                        }]
                    }
                }
            })();

            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));

            const req = https.request(options, res => {
                let body = '';

                res.on('data', chunk => {
                    body += chunk;
                });

                res.on('end', () => {
                    console.log(body)
                });
            });

            req.on('error', err => {
                console.log(err)
            })

            req.write(JSON.stringify(data))
            req.end();
            res.end('owata')
        }
    })
}).listen(config.port || 8080)