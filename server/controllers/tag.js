const TagModel = require('../modules/tag')
const { throwSuccess, throwError, checkRules } = require('../common/response')

class TagController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.list(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await TagModel.list(params)
            throwSuccess(ctx, {
                msg: '查询成功',
                data: result.rows,
                total: result.count
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async add(ctx) {
        try {
            const params = ctx.request.body

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
            let data = await TagModel.findOne({
                tagName: params.tagName
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.tagName + '已存在' })
                return
            }

            // 执行写入
            data = await TagModel.add(params)
            throwSuccess(ctx, {
                msg: '添加成功',
                data
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async edit(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
                {
                    msgLabel: 'id',
                    value: params.id,
                    rules: { required: true }
                },
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

            // 查询是否存在同名
            let data = await TagModel.findOne({
                tagName: params.tagName
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.tagName + '已存在' })
                return
            }

            // 查询是否存在
            data = await TagModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await TagModel.edit(params)
            throwSuccess(ctx, {
                msg: '修改成功',
                data: null
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            const params = ctx.request.body

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
            const data = await TagModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await TagModel.del(params)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = TagController
