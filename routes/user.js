const router = require('koa-router')()
const UserController = require('../server/controllers/user')
router.prefix('/api/user')

// front
// router.post('/register', UserController.register)
// router.post('/login', UserController.login)

// manage
router.post('/list', UserController.list)
router.post('/add', UserController.add)
router.post('/edit', UserController.edit)
router.post('/del', UserController.del)

module.exports = router
