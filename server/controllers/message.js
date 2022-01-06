const { MessageModel, UserModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
const { isMaster } = require('../common/checkUser')

class MessageController {
    static async list(ctx) {
        try {
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

            // 查询评论列表
            const result = await MessageModel.list({
                ...checkPage.data
            })

            // 去重
            const allUserIdsArr = Array.from(
                new Set(
                    result.rows
                        // 获取ids
                        .map(v => v.userId)
                        // 去空元素
                        .filter(v => v)
                )
            )

            // 查询评论者信息
            const usersMap = {}
            if (allUserIdsArr.length) {
                const users = await UserModel.queryByIds(allUserIdsArr)
                users.forEach(item => {
                    usersMap[item.dataValues.id] = item.dataValues
                })
            }
            // user 字段赋值
            result.rows.forEach(item => {
                item.dataValues.user = item.userId ? usersMap[item.userId] : {}
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
                userId,
                parentId,
                content
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'userId', label: '用户ID' },
                { rename: 'content', label: '留言详情', labelEn: 'Message Detail', value: content, rules: { required: true, max: 500, isHTML: true } },
                { rename: 'parentId', value: parentId }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            if (userId) {
                // 用户是否存在
                const user = await UserModel.info(userId)
                if (!user) {
                    throwError(ctx, 'notExist', { msg: '用户ID不存在', msgEn: 'UserId Is Not Exist' })
                    return
                }
            }

            // parentID 是否存在
            if (parentId) {
                const parent = await MessageModel.isExist({ id: parentId })
                if (!parent) {
                    throwError(ctx, 'notExist', { msg: '该留言已删除', msgEn: 'This Message Is Deleted' })
                    return
                }
            }

            // 执行写入
            await MessageModel.add(checkParams.data)
            throwSuccess(ctx, {
                msg: '提交成功',
                msgEn: 'Submit Success'
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
                { rename: 'forbid', label: '是否违规', labelEn: 'forbid', value: forbid, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            // 查询评论是否存在
            const data = await MessageModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'isExist', { msg: '该评论已不存在', msgEn: 'Message Is Already Not Exist' })
                return
            }

            // 执行写入
            await MessageModel.edit(checkParams.data, { id })
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
            const { messageId, userId } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'messageId', labelEn: 'messageId', value: messageId, rules: { required: true } },
                { label: 'userId', labelEn: 'userId', value: userId, rules: { required: false } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await MessageModel.isExist({ id: messageId })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            // 管理员或者留言者自己才能删除
            if (
                await isMaster(ctx) || (userId && userId === data.userId)
            ) {
                // 执行写入
                await MessageModel.del(messageId)

                // 删除子评论
                if (!data.parentId) {
                    await MessageModel.delChild(messageId)
                }

                throwSuccess(ctx, {
                    msg: '删除成功',
                    msgEn: 'Delete Success'
                })
            } else {
                throwError(ctx, 'forbidden', { msg: '无权删除', msgEn: 'You Have No Access To Delete' })
            }
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = MessageController
