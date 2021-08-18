const router = require('koa-router')()
const MenuController = require('../server/controllers/permission')
router.prefix('/api/permission')

router.post('/list', MenuController.list)
router.post('/add', MenuController.add)
router.post('/edit', MenuController.edit)
router.post('/del', MenuController.del)

module.exports = router
