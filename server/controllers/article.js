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

    static async detail(ctx) {
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

            const data = await ArticleModel.detail(params.id)
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
                    msgLabel: '文章作者',
                    value: params.authorId,
                    rules: { required: true }
                },
                {
                    msgLabel: '文章分类',
                    value: params.categoryId,
                    rules: { required: true }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名文章
            let data = await ArticleModel.isExist({
                title: params.title
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.title + '已存在' })
                return
            }

            // authorId是否存在
            data = await UserModel.isExist({
                id: params.authorId
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '作者ID不存在' })
                return
            }

            // categoryId是否存在
            data = await CategoryModel.isExist({
                id: params.categoryId
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                return
            }

            // tagId是否存在
            // if (params.tagIds) {
            //     data = await TagModel.list({
            //         id: params.tagIds
            //     })

            //     if (!data) {
            //         throwError(ctx, 'notExist', { msg: '标签分类不合规' })
            //         return
            //     }
            // }

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
                    msgLabel: '文章作者',
                    value: params.authorId,
                    rules: { required: true }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名文章
            let data = await ArticleModel.isExist({
                title: params.title
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: params.title + '已存在' })
                return
            }

            // authorId是否存在
            data = await UserModel.isExist({
                id: params.authorId
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '作者ID不存在' })
                return
            }

            // categoryId是否存在
            if (params.categoryId) {
                data = await CategoryModel.isExist({
                    id: params.categoryId
                })
                if (!data) {
                    throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                    return
                }
            }

            // tagId是否存在
            if (params.tagIds) {
                data = await TagModel.list({
                    id: params.tagIds
                })

                if (!data) {
                    throwError(ctx, 'notExist', { msg: '标签分类不合规' })
                    return
                }
            }

            // 执行写入
            await ArticleModel.edit(params, params.id)
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
            const data = await ArticleModel.isExist({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据不存在' })
                return
            }

            // 执行写入
            await ArticleModel.del(params.id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = ArticleController
