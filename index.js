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

const cli = https.request(options, res => {
    console.log(res.statusCode);

    res.on('data', chunk => {
        console.log(`chunk`)
    })

    res.on('end', () => {
        console.log('POST owata')
    })
});


server.on('request', (req, res) => {
    console.log('==========request.headers==========\n');
    console.log(req.headers);
    let _body = '';

    req.on('data', chunk => {
        _body += chunk;
    });

    req.on('error', err => {
        console.log('==========errorLog==========\n');
        console.log(err)
    });

    req.on('end', () => {
        const signature = crypto.createHmac('SHA256', config.channelSecret).update(_body).digest('base64');

        if (req.headers['x-line-signature'] === signature) {
            const body = JSON.parse(_body);
            data.replyToken = body.events[0].replyToken;
            
            cli.on('error', err => {
                console.log(err)
            })
            cli.write(JSON.stringify(data));
            cli.end();
            
            console.log('==========requestBodyinStr==========\n')
            console.log(_body);
        }

        res.end("owata\(^o^)/");
    })
}).listen(process.env.PORT || 8080);