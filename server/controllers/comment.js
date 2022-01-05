const { CommentModel, ArticleModel, UserModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
const { isMaster } = require('../common/checkUser')

class CommentController {
    static async list(ctx) {
        try {
            const {
                articleId
            } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                // 允许排序的字段
                ['createdAt']
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'articleId', label: '文章ID', labelEn: 'ArticleId', value: articleId, rules: { required: true } }
            ], 'read')

            // 查询评论列表
            const result = await CommentModel.list({
                ...checkPage.data,
                conditions: checkParams.data
            })

            // 去重 获取userId集合
            const allUserIdsArr = Array.from(
                new Set(
                    result.rows
                        .map(v => v.userId)
                )
            )

            // 查询评论者信息
            const users = await UserModel.queryByIds(allUserIdsArr)
            const usersMap = {}
            users.forEach(item => {
                usersMap[item.dataValues.id] = item.dataValues
            })
            result.rows.forEach(item => {
                item.dataValues.user = usersMap[item.userId]
            })

            // 楼、层分离
            const finallyList = result.rows.filter(item => {
                return !item.parentId
            })
            finallyList.forEach(item => {
                item.dataValues.children = result.rows.filter(v => {
                    return v.parentId === item.id
                })
            })

            throwSuccess(ctx, {
                msg: '查询成功',
                msgEn: 'Query Success',
                data: finallyList,
                total: finallyList.length
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async add(ctx) {
        try {
            const {
                articleId,
                userId,
                parentId,
                content
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'articleId', label: '文章ID', labelEn: 'ArticleId', value: articleId, rules: { required: true } },
                { rename: 'userId', label: '用户ID', labelEn: 'UserId', value: userId, rules: { required: true } },
                { rename: 'content', label: '评论详情', labelEn: 'Comment Detail', value: content, rules: { required: true, max: 500, isHTML: true } },
                { rename: 'parentId', value: parentId }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 文章是否存在
            const article = await ArticleModel.info(userId)
            if (!article) {
                throwError(ctx, 'notExist', { msg: '文章不存在', msgEn: 'Article Is Not Exist' })
                return
            }

            // 用户是否存在
            const user = await UserModel.info(userId)
            if (!user) {
                throwError(ctx, 'notExist', { msg: '用户ID不存在', msgEn: 'UserId Is Not Exist' })
                return
            }

            // parentID 是否存在
            if (parentId) {
                const parent = await CommentModel.isExist({ id: parentId })
                if (!parent) {
                    throwError(ctx, 'notExist', { msg: '该评论已删除', msgEn: 'This Comment Is Deleted' })
                    return
                }
            }

            // 执行写入
            await CommentModel.add(checkParams.data)
            throwSuccess(ctx, {
                msg: '提交评论成功',
                msgEn: 'Reply Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async edit(ctx) {
        try {
            const {
                id,
                forbid
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } },
                { rename: 'forbid', label: '状态', labelEn: 'forbid', value: forbid, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            // 查询评论是否存在
            const data = await CommentModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'isExist', { msg: '该评论已不存在', msgEn: 'Comment Is Already Not Exist' })
                return
            }

            // 执行写入
            await CommentModel.edit(checkParams.data, { id })
            throwSuccess(ctx, {
                msg: '修改成功',
                msgEn: 'Modify Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            const { commentId, userId } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'commentId', labelEn: 'commentId', value: commentId, rules: { required: true } },
                { label: 'userId', labelEn: 'userId', value: userId, rules: { required: false } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await CommentModel.isExist({ id: commentId })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            // 管理员或者留言者自己才能删除
            if (
                !await isMaster(ctx) ||
                (userId && userId !== data.user.id)
            ) {
                throwError(ctx, 'forbidden', { msg: '无权删除', msgEn: 'You Have No Access To Delete' })
                return
            }

            // 执行写入
            await CommentModel.del(commentId)

            // 删除子评论
            if (!data.parentId) {
                await CommentModel.delChild(commentId)
            }

            throwSuccess(ctx, {
                msg: '删除成功',
                msgEn: 'Delete Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = CommentController
