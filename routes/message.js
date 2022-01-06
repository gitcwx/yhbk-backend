const router = require('koa-router')()
const MessageController = require('../server/controllers/message')
router.prefix('/message')

router.post('/list', MessageController.list)
router.post('/add', MessageController.add)
router.post('/edit', MessageController.edit)
router.post('/del', MessageController.del)

module.exports = router
