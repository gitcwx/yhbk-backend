const ArticleModel = require('../modules/article')
const categoryModal = require('../modules/category')
const TagModal = require('../modules/tag')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class ArticleController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const data = await ArticleModel.list(params)
            throwSuccess(ctx, {
                msg: '查询成功',
                data
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
                    msgLabel: '文章标题',
                    value: params.title,
                    rules: { required: true, max: 50 }
                },
                {
                    msgLabel: '文章内容',
                    value: params.content,
                    rules: { required: true, max: 5000 }
                },
                {
                    msgLabel: '文章分类',
                    value: params.categoryId,
                    rules: { required: true, rules: /^\d{1,3}$/ }
                },
                {
                    msgLabel: '文章标签',
                    value: params.tagIds,
                    rules: { rules: /^\d{1,3}(,\d{1,3})*$/ } // 123,23,1 or null
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名文章
            let data = await ArticleModel.findOne({
                title: params.title
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.title + '已存在' })
                return
            }

            // 根据categoryId查询categoryName
            data = await categoryModal.findOne({
                id: params.categoryId
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                return
            }
            params.categoryName = data.categoryName

            // 根据tagId查询tagName
            if (params.tagIds) {
                data = await TagModal.list({
                    tagIds: params.tagIds
                })

                params.tagNames = data.rows.map(v => v.tagName).join(',')
            }

            // 执行写入
            data = await ArticleModel.add(params)
            throwSuccess(ctx, {
                msg: '添加成功',
                data: data
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
                    msgLabel: '文章标题',
                    value: params.title,
                    rules: { required: true, max: 50 }
                },
                {
                    msgLabel: '文章内容',
                    value: params.content,
                    rules: { required: true, max: 5000 }
                },
                {
                    msgLabel: '文章分类',
                    value: params.categoryId,
                    rules: { required: true, rules: /^\d{1,3}$/ }
                },
                {
                    msgLabel: '文章标签',
                    value: params.tagIds,
                    rules: { rules: /^\d{1,3}(,\d{1,3})*$/ } // 123,23,1 or null
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await ArticleModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 根据categoryId查询categoryName
            data = await categoryModal.findOne({
                id: params.categoryId
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                return
            }
            params.categoryName = data.categoryName

            // 根据tagId查询tagName
            if (params.tagIds) {
                data = await TagModal.list({
                    tagIds: params.tagIds
                })
                params.tagNames = data.rows.map(v => v.tagName).join(',')
            } else {
                params.tagNames = ''
            }

            // 执行写入
            await ArticleModel.edit({ id: params.id }, params)
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
            const data = await ArticleModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await ArticleModel.del(params)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = ArticleController
