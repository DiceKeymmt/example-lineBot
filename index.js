require('dotenv').config();

const http = require('http');
const https = require('https');
const crypto = require('crypto');

const apiKey = process.env.API_KEY

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
    port: process.env.PORT
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
            'Content-Length': Buffer.byteLength(JSON.stringify(replyData)),
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

const getData = url => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, res => {
            console.log('getData')
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(body))
            })
        }).on('error', err => {
            reject(err)
        });

        req.end()
    })
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
            console.log('bodyが空です。')
            return
        }

        const signature = crypto.createHmac('SHA256', config.channelSecret).update(body).digest('base64');
        const webhookEventObj = JSON.parse(body);

        if (!req.headers['x-line-signature'] === signature) {
            console.log('Signatureの値が不正です。')
            return
        }

        switch (webhookEventObj.events[0].message.type) {
            case 'text':
                var replyData = {
                    replyToken: webhookEventObj.events[0].replyToken,
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

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                })
                res.end('success')
                break;

            case 'location':
                console.log(body)
                getData(`http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=1`)
                .then(obj => {
                    var replyData = {
                        replyToken: webhookEventObj.events[0].replyToken,
                        messages: [{
                            type: "bubble", // ①
                            body: { // ②
                              type: "box", // ③
                              layout: "horizontal",　// ④
                              contents: [ // ⑤
                                {
                                  type: "text", // ⑥
                                  text: "Hello,"
                                },
                                {
                                  type: "text", // ⑥
                                  text: "World!"
                                }
                              ]
                            }
                          }
                          ]
                    }
                    DataTransmissionToMessageAPI(replyData)
                    .then(d => {
                        console.log(d)
                    })
                    .catch(e => {
                        console.log(e)
                    })
                })
                break;

            default:
                var replyData = {
                    replyToken: webhookEventObj.events[0].replyToken,
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

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                })
                res.end('success')
                break;

        }
    })
}).listen(config.port || 8080);