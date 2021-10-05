const router = require('koa-router')()
const UserController = require('../server/controllers/user')
router.prefix('/user')

// front
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/info', UserController.info)
router.post('/list', UserController.list)
router.post('/add', UserController.add)
router.post('/edit', UserController.edit)
router.post('/password', UserController.password)
router.post('/del', UserController.del)

module.exports = router
