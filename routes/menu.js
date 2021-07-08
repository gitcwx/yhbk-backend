const router = require('koa-router')()
const MenuController = require('../server/controllers/menu');
router.prefix('/api/user')

router.post('/getMenuList', MenuController.menulist)

module.exports = router
