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

        basketS.enter((ctx) => {
            console.log('1234');
    })
    return basketS;
    }
}

module.exports = BasketSceneGenerator