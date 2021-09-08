const { ArticleModel, CategoryModel, TagModel, UserModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
const { isMaster } = require('../common/checkUser')

class ArticleController {
    static async list(ctx) {
        try {
            const {
                keyword,
                isTop,
                status,
                categoryId,
                tagIds,
                authorId
            } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                // 允许排序的字段
                ['title', 'viewCount', 'likeCount', 'isTop', 'status', 'categoryId', 'authorId', 'updatedAt']
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                {
                    rename: '$or',
                    value: keyword,
                    rewrite: {
                        title: {
                            $like: `%${keyword}%`
                        },
                        abstract: {
                            $like: `%${keyword}%`
                        }
                        // content已经转base64 暂时无法查找
                    }
                },
                { rename: 'status', value: status },
                { rename: 'isTop', value: isTop },
                { rename: 'categoryId', value: categoryId },
                { rename: 'tagIds', value: tagIds, rewrite: { $regexp: tagIds.replace(/,/g, '|') } },
                { rename: 'authorId', value: authorId }
            ], 'read')

            // 查询文章列表
            const result = await ArticleModel.list({
                ...checkPage.data,
                conditions: checkParams.data
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
                msgEn: 'Query Success',
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
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', labelEn: 'ID', value: id, rules: { required: true } }
            ], 'read')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            const data = await ArticleModel.detail(id)
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }
            const idsArr = data.tagIds.split(',')
            if (idsArr.length) {
                const tagsArr = await TagModel.queryByIds(idsArr)
                data.dataValues.tags = tagsArr
            }
            throwSuccess(ctx, {
                msg: '查询成功',
                msgEn: 'Query Success',
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

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'title', label: '标题', labelEn: 'Title', value: title, rules: { required: true, max: 50 } },
                { rename: 'cover', value: cover },
                { rename: 'abstract', label: '文章摘要', labelEn: 'Abstract', value: abstract, rules: { required: true, max: 500 } },
                { rename: 'content', label: '文章内容', labelEn: 'Article Detail', value: content, rules: { required: true, max: 5000 } },
                { rename: 'authorId', label: '文章作者', labelEn: 'Author', value: authorId, rules: { required: true } },
                { rename: 'categoryId', label: '文章分类', labelEn: 'Category', value: categoryId, rules: { required: true } },
                { rename: 'tagIds', value: tagIds },
                { rename: 'status', value: status },
                { rename: 'isTop', value: isTop }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            const params = checkParams.data
            // authorId是否存在
            const author = await UserModel.info(authorId)
            if (!author) {
                throwError(ctx, 'notExist', { msg: '作者ID不存在', msgEn: 'Author Is Not Exist' })
                return
            }

            // categoryId是否存在
            const category = await CategoryModel.isExist({ id: categoryId })
            if (!category) {
                throwError(ctx, 'notExist', { msg: '文章分类不合规', msgEn: 'Category Is Not Exist' })
                return
            }
            params.categoryName = category.name

            // 查询是否存在同名文章
            const data = await ArticleModel.isExist({ title })
            if (data) {
                throwError(ctx, 'isExist', { msg: '标题已存在', msgEn: 'Title Is Already Exist' })
                return
            }

            // tagId是否都存在
            if (tagIds) {
                const idsArr = tagIds.split(',')
                const tagsArr = await TagModel.queryByIds(idsArr)
                if (tagsArr.length !== idsArr.length) {
                    throwError(ctx, 'notExist', { msg: '存在不合规的标签', msgEn: 'There Are Error Tags' })
                    return
                }
            }

            // 执行写入
            await ArticleModel.add(params)
            throwSuccess(ctx, {
                msg: '添加成功',
                msgEn: 'Add Success'
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

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } },
                { rename: 'title', label: '标题', labelEn: 'Title', value: title, rules: { required: true, max: 50 } },
                { rename: 'cover', value: cover },
                { rename: 'abstract', label: '文章摘要', labelEn: 'Abstract', value: abstract, rules: { required: true, max: 500 } },
                { rename: 'content', label: '文章内容', labelEn: 'Article Detail', value: content, rules: { required: true, max: 5000 } },
                // 不写rename，后续赋值
                { label: '文章作者', labelEn: 'Author', value: authorId, rules: { required: true } },
                { label: '文章分类', labelEn: 'Category', value: categoryId, rules: { required: true } },
                { rename: 'tagIds', value: tagIds },
                { rename: 'status', value: status },
                { rename: 'isTop', value: isTop }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            const params = checkParams.data
            // 查询文章是否存在
            const data = await ArticleModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'isExist', { msg: '该文章已不存在', msgEn: 'Article Is Already Not Exist' })
                return
            }

            // authorId改变
            if (data.authorId !== authorId) {
                throwError(ctx, 'forbidden', { msg: '无权修改', msgEn: 'No Permission' })
                return
            }
            // categoryId改变
            if (data.categoryId !== categoryId) {
                const category = await CategoryModel.isExist({ id: categoryId })
                if (!category) {
                    throwError(ctx, 'notExist', { msg: '文章分类不合规', msgEn: 'Category Is Not Exist' })
                    return
                } else {
                    params.categoryName = category.name
                    params.categoryId = categoryId
                }
            }
            // tagId改变
            if (data.tagIds !== tagIds) {
                const idsArr = tagIds.split(',')
                if (idsArr.length) {
                    const tagsArr = await TagModel.queryByIds(idsArr)
                    if (tagsArr.length !== idsArr.length) {
                        throwError(ctx, 'notExist', { msg: '存在不合规的标签', msgEn: 'There Are Error Tags' })
                        return
                    }
                }
            }
            // 执行写入
            await ArticleModel.edit(params, {
                id
            })
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
            const { id } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', labelEn: 'ID', value: id, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            // 查询是否存在
            const data = await ArticleModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            // 执行写入
            await ArticleModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功',
                msgEn: 'Delete Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = ArticleController
