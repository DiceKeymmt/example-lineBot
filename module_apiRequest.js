const https = require('https');

const apiRequest = url => {
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

exports.apiRequest = apiRequest;