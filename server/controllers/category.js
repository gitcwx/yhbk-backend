const CategoryModel = require('../modules/category')
const ArticleModel = require('../modules/article')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class CategoryController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await CategoryModel.list(params)
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
                    msgLabel: '分类名',
                    value: params.categoryName,
                    rules: { required: true, max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名分类
            let data = await CategoryModel.findOne({
                categoryName: params.categoryName
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.categoryName + '已存在' })
                return
            }

            // 执行写入
            data = await CategoryModel.add(params)
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
                    msgLabel: '分类名',
                    value: params.categoryName,
                    rules: { required: true, max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名
            let data = await CategoryModel.findOne({
                categoryName: params.categoryName
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.categoryName + '已存在' })
                return
            }

            // 查询是否存在
            data = await CategoryModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await CategoryModel.edit({ id: params.id }, params)
            // 更新文章
            await ArticleModel.edit({
                categoryId: params.id
            }, {
                categoryName: params.categoryName
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
            const data = await CategoryModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await CategoryModel.del(params)
            // 更新文章
            await ArticleModel.edit({
                categoryId: params.id
            }, {
                categoryName: '',
                categoryId: ''
            })
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = CategoryController
