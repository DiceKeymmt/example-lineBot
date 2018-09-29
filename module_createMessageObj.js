const createMessageObj = (jsonData, webhookEventObj) => {
    if (typeof jsonData === 'undefined') {
        return {
            replyToken: webhookEventObj.events[0].replyToken,
            messages: [
                {
                    type: 'text',
                    text: '位置情報を入力してください。'
                }
            ]
        }
    }

    const jsonObj = JSON.parse(jsonData);
    const replyData = {
        replyToken: webhookEventObj.events[0].replyToken,
        messages: [
            {
                type: "carousel",
                contents: []
            }
        ]
    }

    jsonObj.results.shop.forEach(element => {
        replyData.messages[0].contents.push(
            {
                type: "bubble",
                hero: {
                  type: "image",
                  url: element.photo.pc.l,
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
                        label: element.name,
                        uri: element.urls.pc
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
                          text: element.genre.name,
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
                          text: element.mobile_access,
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
                        uri: "line://call/81/1022223333"
                      },
                      style: "primary"
                    }
                  ]
                }
              }
        )
    });

    return replyData;
}
exports.createMessageObj = createMessageObj;