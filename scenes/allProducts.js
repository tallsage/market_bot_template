const Scene = require('telegraf/scenes/base')
const Telegraf = require('telegraf');
const telegram = require('telegraf');
const bot = new Telegraf(process.env.bot_token)
require('dotenv').config()

const {
    countReset
} = require('console');
const {
    resize
} = require('telegraf/markup');


// const mongodb = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

require('events').EventEmitter.defaultMaxListeners = Infinity;

class AllSceneGenerator {
    AllProductScene() {
        const allProdS = new Scene('allProdS')

        allProdS.enter(async (ctx) => {
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
                    allPr[el].img, {
                        caption: `*${allPr[el].name}*\n\n${allPr[el].description}\n\n*${allPr[el].price}*`,
                        parse_mode: 'Markdown'
                    });
                el++
            }
            allProdS.leave()
        })  
        return allProdS
    }
}



module.exports = AllSceneGenerator