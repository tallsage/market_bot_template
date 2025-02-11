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
const cur1Scene = new AddSceneGenerator()
const addProdS = cur1Scene.AddProductScene()

const EditSceneGenerator = require('./scenes/editProdScene')
const cur2EditScene = new EditSceneGenerator()
const editProdS = cur2EditScene.EditProductScene()

const SceneGenerator = require('./scenes/adminScene')
const cur3Scene = new SceneGenerator()
const adminS = cur3Scene.AdminScene()
const userS = cur3Scene.UserScene()

const AllSceneGenerator = require('./scenes/allProducts')
const cur4Scene = new AllSceneGenerator()
const allProdS = cur4Scene.AllProductScene()

const BasketSceneGenerator = require('./scenes/basketScene');
const cur5Scene = new BasketSceneGenerator()
const basketS = cur5Scene.BasketScene()

const stage = new Stage([
    adminS, userS, addProdS, editProdS, allProdS, basketS
])


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
//474319147
// 745243166
var adminsArr = [0]