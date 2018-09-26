const sendRequestToAPIServer = require('./module_sendRequestToAPIServer').sendRequestToAPIServer;

const createMessageObj = (webhookEventObj, apiKey) => {
    switch (webhookEventObj.events[0].message.type) {
        case 'location':
            const messageObj = {
                replyToken: webhookEventObj.events[0].replyToken,
                messages: [
                    {
                        type: "carousel",
                        contents: []
                    }
                ]
            }

            sendRequestToAPIServer(`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json&lat=${webhookEventObj.events[0].message.latitude}&lng=${webhookEventObj.events[0].message.longitude}&range=3&count=10`)
            .then( jsonData => {
                const jsonObj = JSON.parse(jsonData);
                jsonObj.results.shop.forEach( obj => {

                    messageObj.messages[0].contents.push({
                        type: "bubble",
                        hero: {
                          type: "image",
                          url: obj.photo.mobile.s,
                          size: "full"
                        },
                        body: {
                          type: "box",
                          layout: "vertical",
                          spacing: "md",
                          contents: [
                            {
                              type: "button",
                              action: {
                                type: "uri",
                                label: obj.name,
                                uri: obj.urls.pc
                              }
                            },
                            {
                              type: "box",
                              layout: "baseline",
                              contents: [
                                {
                                  type: "text",
                                  text: "ジャンル　/",
                                  size: "xs"
                                },
                                {
                                  type: "text",
                                  text: obj.genre.catch,
                                  size: "xs",
                                  wrap: true
                                }
                              ]
                            },
                            {
                              type: "box",
                              layout: "baseline",
                              contents: [
                                {
                                  type: "text",
                                  text: "交通アクセス　/",
                                  size: "xs"
                                },
                                {
                                  type: "text",
                                  text: obj.mobile_access,
                                  size: "xs",
                                  wrap: true
                                }
                              ]
                            },
                            {
                              type: "button",
                              action: {
                                type: "uri",
                                label: "電話をする",
                                uri: `line://call/81/123456789`
                              },
                              style: "primary"
                            }
                          ]
                        }
                      });
                });
            })

            console.log(JSON.stringify(messageObj));
            break;

        default:
            console.log('not location')

            break;
    }
}

exports.createMessageObj = createMessageObj;