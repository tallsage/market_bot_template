const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf');
const fs = require('fs')
const {
    countReset
} = require('console');
const {
    resize
} = require('telegraf/markup');
const bot = new Telegraf(process.env.bot_token)
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

require('events').EventEmitter.defaultMaxListeners = Infinity;



var nameArr = ['id', 'nameProd', 'description', 'photo', 'price']
var counter = 0
var BDarr = {}

class EditSceneGenerator {
    EditProductScene() {
        const editProdS = new Scene('editProdS')

        editProdS.enter(async (ctx) => {
            await bot.telegram.sendMessage(ctx.chat.id, `введите ${nameArr[counter]} товара`)

            addProdS.on('message', async (ctx) => {
                if (ctx.message.text != undefined) {
                    BDarr[nameArr[counter]] = ctx.message.text
                } else {
                    
                    let file = ctx.message.photo.length - 1
                    let fileId = ctx.message.photo[file].file_id;
                    ctx.telegram.getFileLink(fileId).then(url => {
                        axios({
                            url,
                            responseType: 'stream'
                        }).then(response => {
                            return new Promise((resolve, reject) => {
                                response.data.pipe(fs.writeFileSync(`C:\\Users\\tallsage\\Documents\\code_parade\\market_bot_template\\photo\\${BDarr.id}.png`))

                            });
                        })
                    })
                }

                counter++

                if (nameArr[counter] != undefined) {
                    ctx.scene.reenter()
                } else {
                    counter = 0
                    addProdBD(BDarr.id, BDarr.nameProd, BDarr.description, BDarr.imgUrl, BDarr.price)

                    bot.telegram.sendPhoto(
                        ctx.chat.id, {
                            source: fs.readFileSync(`C:\\Users\\tallsage\\Documents\\code_parade\\market_bot_template\\photo\\${BDarr.id}.png`),
                        }, {
                            caption: `${BDarr.nameProd}\n\n${BDarr.description}\n\n${BDarr.price}`
                        }
                    );

                    await bot.telegram.sendMessage(ctx.chat.id, 'Поздравляю, ты добавил товар и теперь ты в главном меню')
                    ctx.scene.leave()
                }
            })
         })

        return editProdS
    }
}


async function addProdBD(id, nameProd, description, imgUrl, price) {
    try {
        await client.connect();
        console.log('саси');

        const db = client.db('dataB333', {
            returnNonCachedInstance: true
        });
        var col = db.collection("products");
        var myDoc

        myDoc = await col.findOne({
            _id: id
        });

        if (myDoc) {

            col.updateOne({
                _id: id
            }, {
                $set: {
                    "name": nameProd,
                    "description": description,
                    "img": imgUrl,
                    "price": price
                },
            }, {
                upsert: true,
                multi: true
            })
        } else {

            let productInfo = {
                "_id": id,
                "name": nameProd,
                "description": description,
                "img": imgUrl,
                "price": price
            }
            await col.insertOne(productInfo);
        }
    } catch (err) {
        console.log(err);
    }
}

function createButton(text) {

    return ({
        text: text
    })
}

function inlineKeyboard(butQuan, text1, text2, text3, text4) {
    switch (butQuan) {
        case 2:
            return {
                reply_markup: {
                    keyboard: [
                        [createButton(text1),
                            createButton(text2)
                        ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
            break
        case 3:
            return {
                reply_markup: {
                    keyboard: [
                        [createButton(text1),
                            createButton(text2)
                        ],
                        [createButton(text3)]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
            break
        case 4:
            return {
                reply_markup: {
                    keyboard: [
                        [createButton(text1),
                            createButton(text2)
                        ],
                        [createButton(text3),
                            createButton(text4)
                        ]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            }
            break
    }
} //butQuan - это кол-во кнопок в клаве, text1 - текст первой кнопки и т.д.
module.exports = EditSceneGenerator