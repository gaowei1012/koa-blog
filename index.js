const Koa = require('koa')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const ejs = require('ejs')
const koaStatic = require('koa-static')
const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')
const staticCache = require('koa-static-cache')
const config = require('./config/default')
// const router = require('koa-router')
const views = require('koa-views') 
const app = new Koa()

// session 
const sessionMysqlConfig = {
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST,
}
// 配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
}))

// 配置静态资源
app.use(koaStatic(
    path.join(__dirname, 'public')
))

// 缓存
app.use(staticCache(path.join(__dirname, './public'), { dynamic: true }, {
    maxAge: 365*24*60*60
}))
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
    maxAge: 365*24*60*60
}))

// 配置 ejs
app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))
app.use(bodyParser({
    formLimit: '1mb'
}))

// routes
app.use(require('./routes/signin').routes())
app.use(require('./routes/signup').routes())
app.use(require('./routes/posts').routes())
app.use(require('./routes/signout').routes())

app.listen(config.port, () => {
    console.log(`this is server started - ${config.port}`)
})