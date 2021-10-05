const router = require('koa-router')()
const CategoryController = require('../server/controllers/category')
router.prefix('/category')

router.post('/list', CategoryController.list)
router.post('/add', CategoryController.add)
router.post('/edit', CategoryController.edit)
router.post('/del', CategoryController.del)

module.exports = router
