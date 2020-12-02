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

class AllSceneGenerator {
    AllProductScene() {
        const allProdS = new Scene('allProdS')

        allProdS.enter(async (ctx) => {


        })

        return allProdS
    }
}

// async function(){

// }

module.exports = AllSceneGenerator