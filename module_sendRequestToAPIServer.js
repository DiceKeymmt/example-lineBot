const https = require('https');

const sendRequestToAPIServer = (webhookEventObj, url) => {
    if (webhookEventObj.events[0].message.type === 'location') {
        return new Promise((resolve, reject) => {
            const req = https.request(url, res => {
                let body = '';

                res.on('data', chunk => {
                    body += chunk;
                });

                res.on('end', () => {
                    resolve(body);
                });

            }).on('error', err => {
                reject(err);
            });

            req.end();
        });
    }

    Promise.resolve(webhookEventObj)
}

exports.sendRequestToAPIServer = sendRequestToAPIServer;