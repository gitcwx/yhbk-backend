const Koa = require('koa');
const cors = require('koa-cors');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const fs = require('fs');

// jwt token验证
// const koaJwt = require('koa-jwt');
// const checkToken = require('./middlewares/checkToken')
// const jwtSecret = 'token';

// app.use(checkToken())

// 不需验证token的路由
// app.use(
//   koaJwt({ secret: jwtSecret }).unless({
//     path: [/^\/login/],
//   })
// );

// error handler
onerror(app);

// 允许跨域
app.use(cors());
// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
function addRoutes() {
  let files = fs.readdirSync(__dirname + '/routes');
  let js_files = files.filter((f) => {
    return f.endsWith('.js');
  });

  for (let f of js_files) {
    let mapping = require(__dirname + '/routes/' + f);
    app.use(mapping.routes(), mapping.allowedMethods());
  }
}
addRoutes();

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
