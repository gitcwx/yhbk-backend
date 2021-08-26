const { PermissionModel, UserModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
const jwt = require('jsonwebtoken')
const { token } = require('../../config')

class PermissionController {
    static async list(ctx) {
        try {
            const {
                text,
                isMenu,
                by,
                permissionLevel
            } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                ['text', 'name', 'isMenu', 'permissionLevel', 'updatedAt'] // can order list
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }

            // 查询条件参数过滤重组
            const checkList = [
                { rename: 'text', value: text, rewrite: { $like: `%${text}%` } },
                { rename: 'isMenu', value: isMenu }
            ]

            // 请求来源
            if (by === 'userId') {
                const auth = ctx.request.headers.authorization.replace('Bearer ', '')
                const user = await jwt.verify(auth, token.key)
                // 查询用户的permissionLevel
                const level = await UserModel.info(user.id).dataValues.permissionLevel
                checkList.push({
                    rename: 'permissionLevel', value: level, rewrite: { $gte: level }
                })
            } else {
                checkList.push({
                    rename: 'permissionLevel', value: permissionLevel
                })
            }

            const checkParams = checkRuleAndfilterEmpty(checkList)

            const result = await PermissionModel.list({
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
            const {
                text,
                permissionLevel,
                name,
                isMenu,
                icon,
                parentMenuId
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'text', label: '菜单名称', value: text, rules: { required: true, max: 10 } },
                { rename: 'permissionLevel', label: '菜单权限', value: permissionLevel, rules: { required: true, reg: /^\d$/ } },
                { rename: 'name', label: '菜单路由', value: name, rules: { reg: /^[a-zA-z]{1,10}$/ } },
                { rename: 'isMenu', label: '展示到菜单栏', value: isMenu, rules: { reg: /^(false|true)$/ } },
                { rename: 'icon', value: icon },
                { rename: 'parentMenuId', value: parentMenuId }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在同名菜单
            let conditions
            if (name) {
                conditions = {
                    $or: {
                        name,
                        text
                    }
                }
            } else {
                conditions = { text }
            }
            const data = await PermissionModel.isExist(conditions)

            if (data) {
                throwError(ctx, 'isExist', { msg: '菜单名称或标识符已存在' })
                return
            }

            // 执行写入
            await PermissionModel.add(checkParams.data)
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
                text,
                permissionLevel,
                name,
                isMenu,
                icon,
                parentMenuId
            } = ctx.request.body

            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } },
                { rename: 'text', label: '菜单名称', value: text, rules: { required: true, max: 10 } },
                { rename: 'permissionLevel', label: '菜单权限', value: permissionLevel, rules: { required: true, reg: /^\d$/ } },
                { rename: 'name', label: '菜单路由', value: name, rules: { reg: /^[a-zA-z]{1,10}$/ } },
                { rename: 'isMenu', label: '展示到菜单栏', value: isMenu, rules: { reg: /^(false|true)$/ } },
                { rename: 'icon', value: icon },
                { rename: 'parentMenuId', value: parentMenuId }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await PermissionModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            if (name && name !== data.name) {
                data = await PermissionModel.isExist({ name })
                if (data) {
                    throwError(ctx, 'isExist', { msg: '标识符已存在' })
                    return
                }
            }
            if (text !== data.text) {
                data = await PermissionModel.isExist({ text })
                if (data) {
                    throwError(ctx, 'isExist', { msg: '菜单名称已存在' })
                    return
                }
            }

            // 执行写入
            await PermissionModel.edit(checkParams.data, {
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
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } }
            ])
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await PermissionModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 执行写入
            await PermissionModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = PermissionController
