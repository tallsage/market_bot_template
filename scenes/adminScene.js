const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.bot_token)
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const {
    Stage,
    session
} = Telegraf
const uri = process.env.uri
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const AddSceneGenerator = require('./addProdScene')
const cur1Scene = new AddSceneGenerator()
const addProdS = cur1Scene.AddProductScene()

const EditSceneGenerator = require('./editProdScene');
const cur2EditScene = new EditSceneGenerator()
const editProdS = cur2EditScene.EditProductScene()

const AllSceneGenerator = require('./allProducts');
const cur3Scene = new AllSceneGenerator()
const allProdS = cur3Scene.AllProductScene()

const BasketSceneGenerator = require('./basketScene');
const cur4Scene = new BasketSceneGenerator()
const basketS = cur4Scene.BasketScene()

const stage = new Stage([
    addProdS, editProdS, allProdS, basketS
])


bot.use(session())
bot.use(stage.middleware())

require('events').EventEmitter.defaultMaxListeners = Infinity;



class SceneGenerator {
    AdminScene() {
        const adminS = new Scene('adminS')

        adminS.enter((ctx) => {
            bot.telegram.sendMessage(ctx.chat.id, 'Теперь ты в главном меню',
                Keyboard(3, 'добавить продукт', 'редактировать продукт', 'посмотреть все товары')
            )

        })
        adminS.hears('добавить продукт', async (ctx) => {
            ctx.scene.enter('addProdS')

        })
        adminS.hears('редактировать продукт', (ctx) => {
            ctx.scene.enter('editProdS')

        })
        adminS.hears('посмотреть все товары', (ctx) => {
            ctx.scene.enter('allProdS')

        })
        return adminS
    }

    UserScene() {
        const userS = new Scene('userS')

        userS.enter(async (ctx) => {

            bot.telegram.sendMessage(ctx.chat.id, 'привет привет привет привет привет привет привет приветприветпривет привет привет привет ', Keyboard(1, 'корзина'))


            var el = 0
            var allPr = []
            var idArr = []

            async function allProdBD() {
                try {
                    await client.connect();
                    console.log('успешно подключился к бд');

                    const db = client.db('dataB333', {
                        returnNonCachedInstance: true
                    });

                    var col = db.collection("products");

                    var pos = 0
                    var position = 0
                    while (pos != null) {
                        position++
                        pos = await col.findOne({
                            position: position
                        })

                        allPr.push(pos)
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            await allProdBD()


            while (el < allPr.length - 1) {
                bot.telegram.sendPhoto(ctx.chat.id,
                    allPr[el].img, {
                        caption: `*${allPr[el].name}*\n\n${allPr[el].description}\n\n*${allPr[el].price}*`,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: ' добавить в корзину',
                                    callback_data: allPr[el]._id
                                }]
                            ]
                        }
                    });

                idArr.push(allPr[el]._id)
                el++
            }

            userS.action(idArr, async (ctx) => {
                async function addProdToBasket() {
                    try {
                        await client.connect();
                        console.log('успешно подключился к бд');

                        const db = client.db('dataB333', {
                            returnNonCachedInstance: true
                        });

                        var col = db.collection("users");

                        var user = await col.findOne({
                            _id: ctx.chat.id
                        })


                        if (user) {
                            var i = 0
                            var j = 0

                            while (j != user.basket.length) {
                                var flag = false

                                if (user.basket[i].product_id === ctx.match) {
                                    flag = true
                                    break
                                }
                                j++
                            }

                            if (flag == true) {
                                while (i != user.basket.length) {
                                    var lastBasket = user.basket
                                    var basketCounter = user.basket[i].quantitie + 1
                                    if (user.basket[i].product_id === ctx.match) {
                                        lastBasket.splice(i, 1)
                                        var newBasket = {
                                            "product_id": ctx.match,
                                            "quantitie": basketCounter
                                        }
                                        lastBasket.push(newBasket)
                                        col.updateOne({
                                            _id: ctx.chat.id
                                        }, {
                                            $set: {
                                                "basket": lastBasket
                                            }
                                        }, {
                                            upsert: true,
                                            multi: true
                                        })
                                        break
                                    }
                                    i++
                                }
                            } else {
                                var lastBasket = user.basket
                                var newBasket = {
                                    "product_id": ctx.match,
                                    "quantitie": 1
                                }
                                lastBasket.push(newBasket)
                                col.updateOne({
                                    _id: ctx.chat.id
                                }, {
                                    $set: {
                                        "basket": lastBasket
                                    }
                                }, {
                                    upsert: true,
                                    multi: true
                                })
                            }
                        } else {
                            var userInfo = {
                                "_id": ctx.chat.id,
                                "basket": [{
                                    "product_id": ctx.match,
                                    "quantitie": 1
                                }]
                            }
                            await col.insertOne(userInfo)
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
                await addProdToBasket()
            })
        })

        userS.hears('корзина', (ctx) => {
            ctx.scene.enter('basketS')
        })

        return userS
    }
}

function createButton(text) {

    return ({
        text: text
    })
}

function Keyboard(butQuan, text1, text2, text3, text4) {
    switch (butQuan) {
        case 1:
            return {
                reply_markup: {
                        keyboard: [
                            [createButton(text1)],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true

                    },


            }
            break
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

                    },


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


// function createInlineButton(text) {

//     return ({
//         text: text,
//         callback_data: 123
//     })
// }

// function inlineKeyboard(butQuan, text1, text2, text3, text4) {
//     switch (butQuan) {
//         case 1:
//             return {
//                 reply_markup: {
//                     inline_keyboard: [
//                             [createInlineButton(text1)                               
//                             ],
//                         ],

//                     },


//             }
//             break
//         case 2:
//             return {
//                 reply_markup: {
//                     inline_keyboard: [
//                             [createInlineButton(text1),
//                                 createInlineButton(text2)
//                             ],
//                         ],

//                     },


//             }
//             break
//         case 3:
//             return {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [createInlineButton(text1),
//                             createInlineButton(text2)
//                         ],
//                         [createInlineButton(text3)]
//                     ],
//                 }

//             }
//             break
//         case 4:
//             return {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [createInlineButton(text1),
//                             createInlineButton(text2)
//                         ],
//                         [createInlineButton(text3),
//                             createInlineButton(text4)
//                         ]
//                     ],
//                 }
//             }
//             break

//     }
// } //butQuan - это кол-во кнопок в клаве, text1 - текст первой кнопки и т.д.

module.exports = SceneGenerator