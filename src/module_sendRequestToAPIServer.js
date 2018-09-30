const https = require('https');

const sendRequestToAPIServer = (webhookEventObj, url) => {
    return new Promise((resolve, reject) => {
        if (webhookEventObj.events[0].message.type !== 'location') {
            resolve(undefined);
        }

        const req = https.request(url, res => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body)
            });

        }).on('error', err => {
            reject(err);
        });

        req.end();
    })
}

exports.sendRequestToAPIServer = sendRequestToAPIServer;