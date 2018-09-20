require('dotenv').config();

const http = require('http');
const https = require('https');
const crypto = require('crypto');

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
 * http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3
 * 
**/

//MessagingAPIにリクエストを送る
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

//グルメサーチAPIのデータ取得(json形式)
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

//lineBotServer
const server = http.createServer();

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
                                "type": "flex",
                                "altText": "flex message example",
                                "contents": {
                                    "type": "carousel",
                                    "contents": [
                                      {
                                        "type": "bubble",
                                        "hero": {
                                          "type": "image",
                                          "url": "https://andnow.jp/diary/wp-content/uploads/2018/08/38081426_212616786085419_4803702663222919168_n-1024x1024.jpg",
                                          "size": "full"
                                        },
                                        "body": {
                                          "type": "box",
                                          "layout": "vertical",
                                          "contents": [
                                            {
                                              "type": "text",
                                              "text": "店名が入ります。",
                                              "size": "xl",
                                              "weight": "bold"
                                            },
                                            {
                                              "type": "box",
                                              "layout": "horizontal",
                                              "spacing": "md",
                                              "contents": [
                                                {
                                                  "type": "text",
                                                  "text": "ジャンル /",
                                                  "size": "xs",
                                                  "flex": 0
                                                },
                                                {
                                                  "type": "text",
                                                  "text": "お店のジャンルキャッチが入ります。",
                                                  "size": "xs",
                                                  "wrap": true
                                                }
                                              ]
                                            },
                                            {
                                              "type": "box",
                                              "layout": "horizontal",
                                              "spacing": "md",
                                              "contents": [
                                                {
                                                  "type": "text",
                                                  "text": "アクセス /",
                                                  "size": "xs",
                                                  "flex": 0
                                                },
                                                {
                                                  "type": "text",
                                                  "text": "お店への交通アクセスが入ります。",
                                                  "size": "xs",
                                                  "wrap": true
                                                }
                                              ]
                                            },
                                            {
                                              "type": "box",
                                              "layout": "horizontal",
                                              "spacing": "xxl",
                                              "contents": [
                                                {
                                                  "type": "button",
                                                  "action": {
                                                    "type": "uri",
                                                    "label": "ブラウザで開く",
                                                    "uri": "http://www.example.com"
                                                  },
                                                  "style": "primary"
                                                },
                                                {
                                                  "type": "button",
                                                  "action": {
                                                    "type": "uri",
                                                    "label": "電話する",
                                                    "uri": "line://call/81/1022223333"
                                                  },
                                                  "style": "secondary"
                                                }
                                              ]
                                            }
                                          ],
                                          "spacing": "md"
                                        }
                                      }
                                    ]
                                  }
                            }]
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
}).listen(process.env.PORT || 8080);