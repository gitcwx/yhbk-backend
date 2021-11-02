const router = require('koa-router')()

router.get('/*', async (ctx, next) => {
    if (!ctx.body) {
        await ctx.render('index', {
            title: '瀚海星辰'
        })
    }
})

module.exports = router
