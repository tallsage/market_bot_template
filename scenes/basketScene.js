const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.bot_token)
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;

const uri = process.env.uri
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

require('events').EventEmitter.defaultMaxListeners = Infinity;



class BasketSceneGenerator {
    BasketScene() {
        const basketS = new Scene('basketS')

        basketS.enter(async (ctx) => {

            bot.telegram.sendMessage(ctx.chat.id, 'ты в корзине, убедись что выбрал правильное количество товаров')

            var idArrPlus = []
            var idArrMinus = []

            async function basketBD() {
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
                    var i = 0

                    var col = db.collection("products");

                    while (i != user.basket.length) {
                        var prod = await col.findOne({
                            _id: user.basket[i].product_id
                        })

                        bot.telegram.sendPhoto(ctx.chat.id,
                            prod.img, {
                                caption: `*${prod.name}*\n\n${prod.description}\n\n*${prod.price}\n\nвыбранное количество - ${user.basket[i].quantitie}*`,
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: '+',
                                            callback_data: prod._id +' 1'
                                        }, {
                                            text: '-',
                                            callback_data: prod._id
                                        }],
                                    ]
                                }
                            });
                            // if(ctx.match === prod._id){
                            //     idArrMinus.push()
                            // }
                        i++
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            await basketBD()
        })



        basketS.action(idArrPlus, async (ctx) => {
            async function minusProdToBasket() {
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


                        while (i != user.basket.length) {
                            var lastBasket = user.basket
                            var basketCounter = user.basket[i].quantitie - 1
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

                    }
                } catch (err) {
                    console.log(err);
                }
            }
            await minusProdToBasket()
        })

        basketS.action(idArrMinus, async (ctx) => {
            async function plusProdToBasket() {
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

                    }
                } catch (err) {
                    console.log(err);
                }
            }
            await plusProdToBasket()
        })


        return basketS;

    }
}

module.exports = BasketSceneGenerator