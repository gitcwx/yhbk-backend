const router = require('koa-router')()
const TagController = require('../server/controllers/tag')
router.prefix('/tag')

router.post('/list', TagController.list)
router.post('/add', TagController.add)
router.post('/edit', TagController.edit)
router.post('/del', TagController.del)

module.exports = router
