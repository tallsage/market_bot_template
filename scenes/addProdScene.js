const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf');
const {
    countReset
} = require('console');
const {
    resize
} = require('telegraf/markup');
const bot = new Telegraf(process.env.bot_token)
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const client = new MongoClient(process.env.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
require('events').EventEmitter.defaultMaxListeners = Infinity;

var nameArr = ['id', 'nameProd', 'description', 'imgUrl', 'price']
var counter = 0
var BDarr = {}
class AddSceneGenerator {
    AddProductScene() {
        const addProdS = new Scene('addProdS')
        
        addProdS.enter(async (ctx) => {
            await bot.telegram.sendMessage(ctx.chat.id, `введите ${nameArr[counter]} товара`)
            addProdS.on('text', async (ctx) => {
                BDarr[nameArr[counter]] = ctx.message.text
                console.log(BDarr);
                counter++
                if (nameArr[counter] != undefined) {
                    ctx.scene.reenter()
                } else {
                    counter = 0
                    addProdBD(BDarr.id, BDarr.nameProd, BDarr.description, BDarr.imgUrl, BDarr.price)
                    bot.telegram.sendMessage(ctx.chat.id, 'Поздравляю, ты добавил товар и теперь ты в главном меню')
                    ctx.scene.leave()
                }
            })
        })

        return addProdS
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
module.exports = AddSceneGenerator