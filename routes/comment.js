const router = require('koa-router')()
const CommentController = require('../server/controllers/comment')
router.prefix('/comment')

router.post('/list', CommentController.list)
router.post('/add', CommentController.add)
router.post('/edit', CommentController.edit)
router.post('/del', CommentController.del)

module.exports = router
