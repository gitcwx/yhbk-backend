const TagModel = require('../modules/tag')
// const ArticleModel = require('../modules/article')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class TagController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = pagerVerify(params)
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
            let data = await TagModel.isExist({
                name: params.name
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.name + '已存在' })
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
            const errorResponse = paramsVerify([
                {
                    msgLabel: 'id',
                    value: params.id,
                    rules: { required: true }
                },
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

            // 查询是否存在同名
            let data = await TagModel.isExist({
                name: params.name
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.name + '已存在' })
                return
            }

            // 查询是否存在
            data = await TagModel.isExist({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await TagModel.edit(params, params.id)
            throwSuccess(ctx, {
                msg: '修改成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
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
            const data = await TagModel.isExist({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await TagModel.del(params.id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = TagController
