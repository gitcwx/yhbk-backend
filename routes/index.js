const router = require('koa-router')()

router.get('/*', async (ctx, next) => {
    await ctx.render('index', {
        title: '瀚海星辰'
    })
})

module.exports = router
