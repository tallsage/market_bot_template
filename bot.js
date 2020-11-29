const Telegraf = require('telegraf');
const telegram = require('telegraf');
const markup = require('telegraf/markup');
const{
    Stage,
    session
} = Telegraf
require('dotenv').config()
const bot = new Telegraf(process.env.bot_token)

// const MongoClient = require('mongodb').MongoClient;
// const uri = process.env.uri 
// const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });


const AddSceneGenerator = require('./scenes/addProdScene')
const curentScene = new AddSceneGenerator()
const addProdS = curentScene.AddProductScene()

const EditSceneGenerator = require('./scenes/editProdScene')
const curentEditScene = new EditSceneGenerator()
const editProdS = curentEditScene.EditProductScene()

const SceneGenerator = require('./scenes/adminScene')
const curScene = new SceneGenerator()
const adminS = curScene.AdminScene()
const userS = curScene.UserScene()

const stage = new Stage([adminS, userS, addProdS, editProdS])


bot.use(session())
bot.use(stage.middleware())


bot.start(async (ctx, next)=>{
    if (adminsArr.includes(ctx.chat.id)){
      ctx.scene.enter('adminS')
    }else{
        ctx.scene.enter('userS')
    }
})


bot.launch()

var adminsArr = [474319147, 745243166]