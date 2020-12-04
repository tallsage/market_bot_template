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

const AllSceneGenerator = require('./allProducts');
const { keyboard } = require('telegraf/markup');
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
            bot.telegram.sendMessage(ctx.chat.id, 'a', 
            Keyboard(4, 'добавить продукт', 'редактировать продукт', 'посмотреть все товары', 'зайти как покупатель')
            )
            adminS.hears('добавить продукт', async (ctx) => {
                ctx.scene.enter('addProdS')
           })
           adminS.hears('редактировать продукт', (ctx) => {
               console.log('asd');
               ctx.scene.enter('editProdS')
           })
           adminS.hears('посмотреть все товары', (ctx) => {
               ctx.scene.enter('allProdS')

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
            bot.telegram.sendMessage(ctx.chat.id, 'привет привет привет привет привет привет привет приветприветпривет привет привет привет ', Keyboard(1, 'корзина'))
            var allPr = []

            async function addProdBD() {
                try {
                    await client.connect();
                    console.log('успешно подключился к бд');
            
                    const db = client.db('dataB333', {
                        returnNonCachedInstance: true
                    });
            
                    var col = db.collection("products");
        
                    var pos  = 0
                    var position = 0
                    while (pos != null){
                        position ++
                        pos = await col.findOne({
                            position: position
                        })
            
                        allPr.push(pos)
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            await addProdBD()
            
            var el = 0 

            while (el < allPr.length -1){
                bot.telegram.sendPhoto(ctx.chat.id,
                    allPr[el].img,  {
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
                    //     reply_markup:{
                    //         keyboard: [
                    //             ['перейти в корзину']
                    //         ],
                    //         resize_keyboard: true,
                    //         one_time_keyboard: true
                    // }
                    });
                    el++
            }
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
                            [createButton(text1)
                            ],
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