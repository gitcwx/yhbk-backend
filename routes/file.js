const router = require('koa-router')()
const FileController = require('../server/controllers/file')
router.prefix('/file')

router.post('/upload', FileController.upload)

module.exports = router
