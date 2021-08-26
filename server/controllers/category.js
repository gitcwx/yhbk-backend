const { CategoryModel, ArticleModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')

class CategoryController {
    static async list(ctx) {
        try {
            const { name } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                ['name', 'updatedAt'] // can order list
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }
            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'name', value: name, rewrite: { $like: `%${name}%` } }
            ])

            const result = await CategoryModel.list({
                ...checkPage.data,
                conditions: checkParams.data
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
            const { name } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { label: '分类名', value: name, rules: { required: true, max: 10 } }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在同名分类
            const data = await CategoryModel.isExist({ name })
            if (data) {
                throwError(ctx, 'isExist', { msg: name + '已存在' })
                return
            }

            // 执行写入
            await CategoryModel.add({ name })
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
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'id', value: id, rules: { required: true } },
                { label: '分类名', value: name, rules: { required: true, max: 10 } }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await CategoryModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 查询是否存在同名
            data = await CategoryModel.isExist({ name })
            if (data) {
                throwError(ctx, 'isExist', { msg: name + '已存在' })
                return
            }

            // 执行写入
            await CategoryModel.edit({
                name
            }, {
                id
            })

            // 更新文章
            await ArticleModel.edit({
                categoryName: name
            }, {
                categoryId: id
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
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'id', value: id, rules: { required: true } }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await CategoryModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 查询分类下面有没有文章
            data = await ArticleModel.isExist({ categoryId: id })
            if (data) {
                throwError(ctx, 'isExist', { msg: '该分类下存在文章，不可删除' })
                return
            }

            // 执行写入
            await CategoryModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = CategoryController
