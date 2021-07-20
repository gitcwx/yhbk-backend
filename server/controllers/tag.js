const TagModel = require('../modules/tag')
const { throwSuccess, throwError, checkRules } = require('../common/response')

class TagController {
    static async list(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.list(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const data = await TagModel.list(params)

            throwSuccess(ctx, {
                msg: "查询成功",
                data
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async add(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
                {
                    msgLabel: '标签名',
                    value: params.tagName,
                    rules: { required: true, max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名标签
            let data = await TagModel.list({
                tagName: params.tagName,
                isEqual: true
            })
            if (data.length) {
                throwError(ctx, 'isExist', { msg: params.tagName + '已存在' })
                return
            }

            // 执行写入
            data = await TagModel.add(params)

            throwSuccess(ctx, {
                msg: "添加成功",
                data: data
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async edit(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse =
                checkRules.inputs([
                    {
                        msgLabel: 'id',
                        value: params.id,
                        rules: { required: true }
                    },
                    {
                        msgLabel: '标签名',
                        value: params.tagName,
                        rules: {
                            required: true,
                            max: 10
                        }
                    }
                ])

            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名
            let data = await TagModel.list({
                tagName: params.tagName,
                isEqual: true
            })
            if (data.length) {
                throwError(ctx, 'isExist', { msg: params.tagName + '已存在' })
                return
            }

            // 查询是否存在
            data = await TagModel.list({
                id: params.id
            })
            if (data.length === 0) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            const item = await TagModel.edit(params)
            data = await TagModel.list({
                id: item.id
            })

            throwSuccess(ctx, {
                msg: "修改成功",
                data: data[0]
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
                {
                    msgLabel: 'id',
                    value: params.id,
                    rules: { required: true }
                }
            ])

            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await TagModel.list({
                id: params.id
            })
            if (data.length === 0) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await TagModel.del({
                id: params.id
            })

            throwSuccess(ctx, {
                msg: "删除成功"
            })

        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = TagController
