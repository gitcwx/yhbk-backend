const {
    TagModel
} = require('../model')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class TagController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            const page = Number(params.page || 1)
            const limit = Number(params.limit || 10)
            const orderby = params.orderby || 'desc'
            const orderName = params.orderName || 'updatedAt'
            const name = params.name || ''

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await TagModel.list({
                page,
                limit,
                orderby,
                orderName,
                name
            })
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
            const errorResponse = paramsVerify([
                {
                    msgLabel: '标签名',
                    value: params.name,
                    rules: { required: true, max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名标签
            const data = await TagModel.isExist({
                name: params.name
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.name + '已存在' })
                return
            }

            // 执行写入
            await TagModel.add({ name: params.name })
            throwSuccess(ctx, {
                msg: '添加成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async edit(ctx) {
        try {
            const {
                id,
                name
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: 'id',
                    value: id,
                    rules: { required: true }
                },
                {
                    msgLabel: '标签名',
                    value: name,
                    rules: { required: true, max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await TagModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 查询是否存在同名
            data = await TagModel.isExist({ name })
            if (data) {
                throwError(ctx, 'isExist', { msg: name + '已存在' })
                return
            }

            // 执行写入
            await TagModel.edit({
                name
            }, {
                id
            })
            throwSuccess(ctx, {
                msg: '修改成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            const { id } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                { msgLabel: 'id', value: id, rules: { required: true } }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            const data = await TagModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 执行写入
            await TagModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = TagController
