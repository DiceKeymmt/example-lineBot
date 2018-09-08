const http = require('http');

const client = url => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, res => {
            let body = '';
            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(body))
            })
        }).on('error', err => {
            console.log(err)
        })

        req.end()
    })
}

exports.client = client