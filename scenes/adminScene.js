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
const { createContext } = require('vm');
const cur2EditScene = new EditSceneGenerator()
const editProdS = cur2EditScene.EditProductScene()

const AllSceneGenerator = require('./allProducts')
const cur3Scene = new AllSceneGenerator()
const allProdS = cur3Scene.AllProductScene()

const stage = new Stage([
    addProdS, editProdS, allProdS
])


bot.use(session())
bot.use(stage.middleware())

require('events').EventEmitter.defaultMaxListeners = Infinity;



class SceneGenerator {
    AdminScene() {
        const adminS = new Scene('adminS')

        adminS.enter((ctx) => {
            bot.telegram.sendMessage(ctx.chat.id, 'a', inlineKeyboard(4, 'добавить продукт', 'редактировать продукт', 'посмотреть все товары', 'зайти как покупатель'))
            adminS.hears('добавить продукт', async (ctx) => {
                ctx.scene.enter('addProdS')
           })
           adminS.hears('редактировать продукт', (ctx) => {
               console.log('asd');
               ctx.scene.enter('editProdS')
           })
           adminS.hears('посмотреть все товары', (ctx) => {
               ctx.scene.enter('showProdS')

           })
           adminS.hears('зайти как покупатель', (ctx) => {
               ctx.scene.enter('enterAsUserS')
           })
            
        })
       

        return adminS
    }
    UserScene() {
        const userS = new Scene('userS')
        userS.enter(async (ctx) => {
            console.log('user');
        })
        return userS
    }

}
async function addProdBD(id, nameProd, description, imgUrl, price) {
    try {
        await client.connect();
        const db = client.db('dataB333', {
            returnNonCachedInstance: true
        });
        var col = db.collection("products");
        let productInfo = {
            "_id": id,
            "name": nameProd,
            "description": description,
            "img": imgUrl,
            "price": price
        }
        await col.insertOne(productInfo);
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
module.exports = SceneGenerator