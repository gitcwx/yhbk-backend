const router = require('koa-router')()
const ArticleController = require('../server/controllers/article')
router.prefix('/article')

router.post('/list', ArticleController.list)
router.post('/count', ArticleController.count)
router.post('/detail', ArticleController.detail)
router.post('/add', ArticleController.add)
router.post('/edit', ArticleController.edit)
router.post('/del', ArticleController.del)

module.exports = router
