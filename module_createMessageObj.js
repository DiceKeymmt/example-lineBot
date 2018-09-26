const sendRequestToAPIServer = require('./module_sendRequestToAPIServer').sendRequestToAPIServer;

const createMessageObj = (webhookEventObj, apiKey) => {
    switch (webhookEventObj.events[0].message.type) {
        case 'location':
            sendRequestToAPIServer(`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=10`)
            .then( jsonData => {
                const jsonObj = JSON.parse(jsonData);
                jsonObj.results.shop.forEach(element => {
                    console.log(element.name)
                });
            })

            break;

        default:
            console.log('not location')

            break;
    }
}

exports.createMessageObj = createMessageObj;