const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf');
const telegram = require('telegraf');
const axios = require('axios')
const fs = require('fs');
const {
    countReset
} = require('console');
const {
    resize
} = require('telegraf/markup');
const bot = new Telegraf(process.env.bot_token)

require('dotenv').config()

// const mongodb = require('mongodb')
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
            if (nameArr[counter] == 'id') {
                await bot.telegram.sendMessage(ctx.chat.id, `введите существующий ${nameArr[counter]}  товара`)
            }
            else{
                await bot.telegram.sendMessage(ctx.chat.id, `введите новый ${nameArr[counter]}  товара`)
            }
            
            editProdS.on('message', async (ctx) => {
                if (ctx.message.text != undefined) {
                    BDarr[nameArr[counter]] = ctx.message.text
                } else {
                    BDarr[nameArr[counter]] = ctx.message.photo[0].file_id
                }

                counter++

                if (nameArr[counter] != undefined) {
                    ctx.scene.reenter()
                } else {

                    counter = 0

                    editProdBD(BDarr.id, BDarr.nameProd, BDarr.description, BDarr.photo, BDarr.price)


                    bot.telegram.sendPhoto(ctx.chat.id,
                        BDarr.photo, {
                            caption: `*${BDarr.nameProd}*\n\n${BDarr.description}\n\n*${BDarr.price}*`,
                            parse_mode: 'Markdown'
                        });
                    await bot.telegram.sendMessage(ctx.chat.id, 'Поздравляю, ты добавил товар и теперь ты в главном меню')


                    ctx.scene.leave()
                }
            })
        })
        return editProdS
    }
}


async function editProdBD(id, nameProd, description, imgUrl, price) {
    try {
        await client.connect();
        console.log('успешно подключился к бд');

        const db = client.db('dataB333', {
            returnNonCachedInstance: true
        });


        //нечто что нужно для пуша картинки в бд
        // var bucket = new mongodb.GridFSBucket(db);
        // fs.createReadStream(`${BDarr.id}.png`).
        // pipe(bucket.openUploadStream(`${BDarr.id}.png`))
        // var col = db.collection("fs.chunchs")


        var col = db.collection("products");

        var pos  = 0
        var position = 0
        while (pos != null){
            position ++
            pos = await col.findOne({
                position: position
            })
        }

        var myDoc = await col.findOne({
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
                "price": price,
                "position": position
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