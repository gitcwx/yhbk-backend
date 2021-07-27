const Koa = require('koa')
const cors = require('koa2-cors')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const fs = require('fs')
const path = require('path')
// jwt token验证
const koaJwt = require('koa-jwt')
const { tokenKey } = require('./config/token')
const { throwError } = require('./server/common/response')

// error handler
onerror(app)

// 允许跨域
app.use(cors())

// token验证处理
app.use(async (ctx, next) => {
    return next().catch((err) => {
        if (err.originalError && err.originalError.message === 'jwt expired') {
            throwError(ctx, 405)
        } else {
            throwError(ctx, 401)
        }
    })
})
// token验证拦截
app.use(
    koaJwt({
        secret: tokenKey
    }).unless({
        path: [/login/, '/api/user/register']
    })
)

app.use(
    bodyparser({
        enableTypes: ['json', 'form', 'text']
    })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(path.join(__dirname, '/public')))

app.use(
    views(path.join(__dirname, '/views'), {
        extension: 'pug'
    })
)

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
function addRoutes() {
    const files = fs.readdirSync(path.join(__dirname, '/routes'))
    const jsFiles = files.filter((f) => {
        return f.endsWith('.js')
    })

    for (const f of jsFiles) {
        const mapping = require(path.join(__dirname, '/routes/', f))
        app.use(mapping.routes(), mapping.allowedMethods())
    }
}
addRoutes()

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
})

module.exports = app
