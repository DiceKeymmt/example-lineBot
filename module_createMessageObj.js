const sendRequestToAPIServer = require('./module_sendRequestToAPIServer').sendRequestToAPIServer;

const createMessageObj = (webhookEventObj, apiKey) => {
    switch (webhookEventObj.events[0].message.type) {
        case 'location':
            sendRequestToAPIServer(`http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=1`)
            .then( v => {
                console.log(v)
            })

            break;

        default:
            console.log('not location')

            break;
    }
}

exports.createMessageObj = createMessageObj;