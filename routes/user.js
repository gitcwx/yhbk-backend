const router = require('koa-router')()
const UserController = require('../server/controllers/user')
router.prefix('/api/user')

// front
router.post('/register', UserController.register)
router.post('/login', UserController.login)

// manage
router.post('/list', UserController.list)
router.post('/add', UserController.add)
router.post('/info', UserController.info)
router.post('/password', UserController.password)
router.post('/del', UserController.del)

module.exports = router
