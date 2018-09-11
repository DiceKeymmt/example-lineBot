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

        console.log('Transmission')
        req.write(JSON.stringify(replyData));
        req.end()
    });
}

server.on('request', (req, res) => {

    console.log('request => server')
    console.log(`Header
${req.headers}`)
    console.log(req.url)

    if (req.url !== '/webhook' || req.method !== 'POST') {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end(`404 Not Found`)
    }

    let body = '';

    req.on('data', chunk => {

        console.log('request => data => server')
        
        body += chunk;
    });

    req.on('end', () => {
        
        console.log('request => end => server')
        
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

        console.log('request => message => server')

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

                console.log('break')
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

                break;

        }
    })

    console.log('server => end')

    res.end('owata');
}).listen(config.port || 8080);