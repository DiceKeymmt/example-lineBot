const https = require('https');

const dataReply = (config, sendMessageObj) => {
    const options = {
        protocol: 'https:',
        host: 'api.line.me',
        path: '/v2/bot/message/reply',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.channelAccessToken}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(sendMessageObj))
        }
    }

    const req = https.request(options, res => {
        let body = '';

        res.on('data', chunk => {
            body += chunk;
        });

        res.on('end', () => {
            console.log(body);
        });

    }).on('error', err => {
        console.log(err);
    });

    req.write(JSON.stringify(sendMessageObj));
    req.end();
}

exports.dataReply = dataReply;