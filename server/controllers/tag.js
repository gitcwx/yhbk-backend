const { TagModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')

class TagController {
    static async list(ctx) {
        try {
            const {
                name,
                nameEn
            } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                ['name', 'nameEn', 'updatedAt'] // can order list
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'name', value: name, rewrite: { $like: `%${name}%` } },
                { rename: 'nameEn', value: nameEn, rewrite: { $like: `%${nameEn}%` } }
            ], 'read')

            const result = await TagModel.list({
                ...checkPage.data,
                conditions: checkParams.data
            })
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

    static async add(ctx) {
        try {
            const {
                name,
                nameEn
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'name', label: '标签名', labelEn: 'Tag Name In Chinese', value: name, rules: { required: true, max: 10 } },
                { rename: 'nameEn', label: '英文标签名', labelEn: 'Tag Name', value: nameEn, rules: { required: true, max: 10 } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在同名标签
            let data = await TagModel.isExist({ name })
            if (data) {
                throwError(ctx, 'isExist', { msg: '标签名已存在', msgEn: 'Tag Name In Chinese Is Already Exist' })
                return
            }
            data = await TagModel.isExist({ nameEn })
            if (data) {
                throwError(ctx, 'isExist', { msg: '英文标签名称已存在', msgEn: 'Tag Name Is Already Exist' })
                return
            }

            // 执行写入
            await TagModel.add(checkParams.data)
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
                name,
                nameEn
            } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'id', value: id, rules: { required: true } },
                { rename: 'name', label: '标签名', labelEn: 'Tag Name In Chinese', value: name, rules: { required: true, max: 10 } },
                { rename: 'nameEn', label: '英文标签名', labelEn: 'Tag Name', value: nameEn, rules: { required: true, max: 10 } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await TagModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Not Already Exist' })
                return
            }

            // 查询是否存在同名
            if (name && name !== data.name) {
                const checkName = await TagModel.isExist({ name })
                if (checkName) {
                    throwError(ctx, 'isExist', { msg: '标签名已存在', msgEn: 'Tag Name In Chinese Is Already Exist' })
                    return
                }
            }
            if (nameEn && nameEn !== data.nameEn) {
                const checkNameEn = await TagModel.isExist({ nameEn })
                if (checkNameEn) {
                    throwError(ctx, 'isExist', { msg: '英文标签名已存在', msgEn: 'Tag Name Is Already Exist' })
                    return
                }
            }

            // 执行写入
            await TagModel.edit(checkParams.data, {
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
                { label: 'id', value: id, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await TagModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            // 执行写入
            await TagModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功',
                msgEn: 'Delete Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = TagController
