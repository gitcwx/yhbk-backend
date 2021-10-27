const { PermissionModel, UserModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
const { isMaster } = require('../common/checkUser')
const jwt = require('jsonwebtoken')
const { token } = require('../../config')

class PermissionController {
    static async list(ctx) {
        try {
            const {
                text,
                textEn,
                isMenu,
                by,
                permissionLevel
            } = ctx.request.body

            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                // 允许排序的字段
                ['text', 'textEn', 'name', 'isMenu', 'permissionLevel', 'parentMenuId', 'updatedAt', 'createdAt']
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }

            // 查询条件参数过滤重组
            const checkList = [
                { rename: 'text', value: text, rewrite: { $like: `%${text}%` } },
                { rename: 'textEn', value: textEn, rewrite: { $like: `%${textEn}%` } },
                { rename: 'isMenu', value: isMenu }
            ]

            // 请求来源
            if (by === 'userId') {
                const auth = ctx.request.headers.authorization.replace('Bearer ', '')
                const user = await jwt.verify(auth, token.key)
                // 查询用户的permissionLevel
                const data = await UserModel.info(user.id)
                const level = data.dataValues.permissionLevel
                checkList.push({
                    rename: 'permissionLevel', value: level, rewrite: { $gte: level }
                })
            } else {
                checkList.push({
                    rename: 'permissionLevel', value: permissionLevel
                })
            }
            const checkParams = checkRuleAndfilterEmpty(checkList, 'read')

            const result = await PermissionModel.list({
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
                text,
                textEn,
                permissionLevel,
                name,
                isMenu,
                icon,
                parentMenuId
            } = ctx.request.body

            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'text', label: '页面名称', labelEn: 'Menu Name In Chinese', value: text, rules: { required: true, max: 10, reg: /^[\u4e00-\u9fa50-9]{1,10}$/ } },
                { rename: 'textEn', label: '英文页面名称', labelEn: 'Menu Name', value: textEn, rules: { required: true, max: 20, reg: /^[a-zA-Z0-9\s]{1,20}$/ } },
                { rename: 'permissionLevel', label: '页面权限', labelEn: 'Permission', value: permissionLevel, rules: { required: true, reg: /^\d$/ } },
                { rename: 'name', label: '页面路由标识', labelEn: 'Route Name', value: name, rules: { reg: /^[a-zA-z.]{1,30}$/ } },
                { rename: 'isMenu', label: '展示到页面栏', labelEn: 'IsMenu', value: isMenu, rules: { reg: /^(false|true)$/ } },
                { rename: 'icon', value: icon },
                { rename: 'parentMenuId', value: parentMenuId }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            if (name) {
                const checkName = await PermissionModel.isExist({ name })
                if (checkName) {
                    throwError(ctx, 'isExist', { msg: '标识符已存在', msgEn: 'Route Name Is Already Exist' })
                    return
                }
            }

            const checkText = await PermissionModel.isExist({ text })
            if (checkText) {
                throwError(ctx, 'isExist', { msg: '页面名称已存在', msgEn: 'Menu Name In Chinese Is Already Exist' })
                return
            }

            const checkTextEn = await PermissionModel.isExist({ textEn })
            if (checkTextEn) {
                throwError(ctx, 'isExist', { msg: '英文页面名称已存在', msgEn: 'Menu Name Is Already Exist' })
                return
            }

            // 执行写入
            await PermissionModel.add(checkParams.data)
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
                text,
                textEn,
                permissionLevel,
                name,
                isMenu,
                icon,
                parentMenuId
            } = ctx.request.body

            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } },
                { rename: 'text', label: '页面名称', labelEn: 'Menu Name In Chinese', value: text, rules: { max: 10, reg: /^[\u4e00-\u9fa50-9]{1,10}$/ } },
                { rename: 'textEn', label: '英文页面名称', labelEn: 'Menu Name', value: textEn, rules: { max: 20, reg: /^[a-zA-Z0-9\s]{1,20}$/ } },
                { rename: 'permissionLevel', label: '页面权限', labelEn: 'Permission', value: permissionLevel, rules: { reg: /^\d$/ } },
                { rename: 'name', label: '页面路由标识', labelEn: 'Route Name', value: name, rules: { reg: /^[a-zA-z.]{1,30}$/ } },
                { rename: 'isMenu', label: '展示到页面栏', labelEn: 'IsMenu', value: isMenu, rules: { reg: /^(false|true)$/ } },
                { rename: 'icon', value: icon },
                { rename: 'parentMenuId', value: parentMenuId }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 非管理员不可操作
            if (!await isMaster(ctx)) { return }

            // 查询是否存在
            const data = await PermissionModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            if (name && name !== data.name) {
                const checkName = await PermissionModel.isExist({ name })
                if (checkName) {
                    throwError(ctx, 'isExist', { msg: '标识符已存在', msgEn: 'Route Name Is Already Exist' })
                    return
                }
            }

            if (text && text !== data.text) {
                const checkText = await PermissionModel.isExist({ text })
                if (checkText) {
                    throwError(ctx, 'isExist', { msg: '页面名称已存在', msgEn: 'Menu Name In Chinese Is Already Exist' })
                    return
                }
            }

            if (textEn && textEn !== data.textEn) {
                const checkText = await PermissionModel.isExist({ textEn })
                if (checkText) {
                    throwError(ctx, 'isExist', { msg: '英文页面名称已存在', msgEn: 'Menu Name Is Already Exist' })
                    return
                }
            }

            // 执行写入
            await PermissionModel.edit(checkParams.data, {
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
            const data = await PermissionModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在', msgEn: 'Data Is Already Not Exist' })
                return
            }

            // 执行写入
            await PermissionModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功',
                msgEn: 'Delete Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = PermissionController
