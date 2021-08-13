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
            const keyword = params.keyword
            const isTop = params.isTop
            const status = params.status
            const categoryId = params.categoryId
            const tagIds = params.tagIds

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询文章列表
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

            // 降维 去重 获取tagId集合
            const allTagIdsArr = Array.from(
                new Set(
                    result.rows
                        .map(v => v.tagIds.split(','))
                        .flat()
                )
            )
            if (allTagIdsArr.length) {
                // 查询这些tag属性
                const tags = await TagModel.queryByIds(allTagIdsArr)
                // 数组转对象
                const tagsMap = {}
                tags.forEach(item => {
                    tagsMap[item.dataValues.id] = item.dataValues.name
                })
                result.rows.forEach(item => {
                    item.dataValues.tags = item.dataValues.tagIds.split(',').map(v => ({ id: v, name: tagsMap[v] }))
                })
            }

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
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }
            const idsArr = data.tagIds.split(',')
            if (idsArr.length) {
                const tagsArr = await TagModel.queryByIds(idsArr)
                data.dataValues.tags = tagsArr
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
            const {
                title,
                cover,
                abstract,
                content,
                authorId,
                categoryId,
                tagIds,
                status,
                isTop
            } = ctx.request.body

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

            // authorId是否存在
            const author = await UserModel.info(authorId)
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
            const categoryName = category.name

            // 查询是否存在同名文章
            const data = await ArticleModel.isExist({ title })
            if (data) {
                throwError(ctx, 'isExist', { msg: title + '已存在' })
                return
            }

            // 非必填参数
            const temp = {}
            if (tagIds) {
                const idsArr = tagIds.split(',')
                const tagsArr = await TagModel.queryByIds(idsArr)
                if (tagsArr.length === idsArr.length) {
                    temp.tagIds = tagIds
                } else {
                    throwError(ctx, 'notExist', { msg: '存在不合规的标签' })
                    return
                }
            }

            cover && (temp.cover = cover)
            isTop && (temp.isTop = isTop === 'true')
            status && (temp.status = status)

            // 执行写入
            await ArticleModel.add({
                title,
                abstract,
                content,
                authorId,
                author,
                categoryId,
                categoryName,
                ...temp
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
                cover,
                abstract,
                content,
                authorId,
                categoryId,
                tagIds,
                status,
                isTop
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                { msgLabel: 'id', value: id, rules: { required: true } },
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

            // 查询文章是否存在
            const data = await ArticleModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'isExist', { msg: '该文章已不存在' })
                return
            }

            const temp = {}
            // authorId改变
            if (data.authorId !== authorId) {
                temp.authorId = authorId
                temp.author = await UserModel.isExist({ id: authorId })
                if (!temp.author) {
                    throwError(ctx, 'notExist', { msg: '作者ID不存在' })
                    return
                }
            }
            // categoryId改变
            if (data.categoryId !== categoryId) {
                const category = await CategoryModel.isExist({ id: categoryId })
                if (!category) {
                    throwError(ctx, 'notExist', { msg: '文章分类不合规' })
                    return
                } else {
                    temp.categoryName = category.name
                    temp.categoryId = categoryId
                }
            }
            // tagId改变
            if (tagIds !== undefined && data.tagIds !== tagIds) {
                const idsArr = tagIds.split(',')
                if (idsArr.length) {
                    const tagsArr = await TagModel.queryByIds(idsArr)
                    if (tagsArr.length === idsArr.length) {
                        temp.tagIds = tagIds
                    } else {
                        throwError(ctx, 'notExist', { msg: '存在不合规的标签' })
                        return
                    }
                } else {
                    temp.tagIds = ''
                }
            }
            // 封面改变
            if (cover !== undefined && data.cover !== cover) {
                temp.cover = cover
            }
            // 置顶改变
            if (isTop !== undefined && data.isTop !== isTop) {
                temp.isTop = isTop === 'true'
            }
            // 状态改变
            if (status !== undefined && data.status !== status) {
                temp.status = status
            }
            // 执行写入
            await ArticleModel.edit({
                title,
                abstract,
                content,
                ...temp
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
            const data = await ArticleModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
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
