const {
    ArticleModel,
    CategoryModel,
    TagModel,
    UserModel
} = require('../model')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class ArticleController {
    static async list(ctx) {
        try {
            const params = ctx.request.body
            const page = Number(params.page || 1)
            const limit = Number(params.limit || 10)
            const orderby = params.orderby || 'desc'
            const orderName = params.orderName || 'updatedAt'
            const keyword = params.keyword || ''
            const isTop = params.isTop === 'true'
            const status = params.status || Number()
            const categoryId = params.categoryId || ''
            const tagIds = params.tagIds || ''

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await ArticleModel.list({
                page,
                limit,
                orderby,
                orderName,
                keyword,
                isTop,
                status,
                categoryId,
                tagIds
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

    static async detail(ctx) {
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

            const data = await ArticleModel.detail(id)
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }
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

            const title = params.title
            const cover = params.cover
            const abstract = params.abstract
            const content = params.content
            const authorId = params.authorId
            const categoryId = params.categoryId
            const tagIds = params.tagIds || ''
            const status = params.status || 1
            const isTop = params.isTop === 'true'

            // 参数规则检测
            const errorResponse = paramsVerify([
                { msgLabel: '文章标题', value: title, rules: { required: true, max: 50 } },
                { msgLabel: '文章摘要', value: abstract, rules: { required: true, max: 500 } },
                { msgLabel: '文章内容', value: content, rules: { required: true, max: 5000 } },
                { msgLabel: '文章作者', value: authorId, rules: { required: true } },
                { msgLabel: '文章分类', value: categoryId, rules: { required: true } }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名文章
            const data = await ArticleModel.isExist({ title })
            if (data) {
                throwError(ctx, 'isExist', { msg: title + '已存在' })
                return
            }

            // authorId是否存在
            const author = await UserModel.isExist({ id: authorId })
            if (!author) {
                throwError(ctx, 'notExist', { msg: '作者ID不存在' })
                return
            }

            // categoryId是否存在
            const category = await CategoryModel.isExist({ id: categoryId })
            if (!category) {
                throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                return
            }

            // tagId是否存在
            let tags = []
            if (tagIds) {
                tags = await TagModel.queryByIds(tagIds)
                if (!tags.length) {
                    throwError(ctx, 'notExist', { msg: '标签分类不合规' })
                    return
                }
            }

            // 执行写入
            await ArticleModel.add({
                title,
                cover,
                abstract,
                content,
                isTop,
                status,
                authorId,
                author,
                categoryId,
                category,
                tagIds,
                tags
            })
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
                title,
                content,
                authorId,
                categoryId,
                tagIds
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                { msgLabel: 'id', value: id, rules: { required: true } },
                { msgLabel: '文章标题', value: title, rules: { required: true, max: 50 } },
                { msgLabel: '文章内容', value: content, rules: { required: true, max: 5000 } },
                { msgLabel: '文章作者', value: authorId, rules: { required: true } }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名文章
            let data = await ArticleModel.isExist({ title })
            if (data) {
                throwError(ctx, 'isExist', { msg: title + '已存在' })
                return
            }

            // authorId是否存在
            data = await UserModel.isExist({ id: authorId })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '作者ID不存在' })
                return
            }

            // categoryId是否存在
            if (categoryId) {
                data = await CategoryModel.isExist({ id: categoryId })
                if (!data) {
                    throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                    return
                }
            }

            // tagId是否存在
            if (tagIds) {
                data = await TagModel.list({
                    id: tagIds
                })

                if (!data) {
                    throwError(ctx, 'notExist', { msg: '标签分类不合规' })
                    return
                }
            }

            // 执行写入
            await ArticleModel.edit({
                id,
                title,
                content,
                authorId,
                categoryId,
                tagIds
            }, id)
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
            const data = await ArticleModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await ArticleModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = ArticleController
