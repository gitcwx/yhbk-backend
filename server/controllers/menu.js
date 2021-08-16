const {
    MenuModel,
    UserModel
} = require('../model')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')

class MenuController {
    static async list(ctx) {
        try {
            const params = ctx.request.body

            const page = Number(params.page || 1)
            const limit = Number(params.limit || 10)
            const orderby = params.orderby || 'desc'
            const orderName = params.orderName || 'updatedAt'
            const text = params.text || ''
            const userId = params.userId

            // 参数规则检测
            const errorResponse = pagerVerify(params) || paramsVerify([
                {
                    msgLabel: '用户ID',
                    value: userId,
                    rules: { required: true }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }
            // 查询用户的permissionLevel
            const data = await UserModel.info(userId)

            const result = await MenuModel.list({
                page,
                limit,
                orderby,
                orderName,
                text,
                permissionLevel: data.dataValues.permissionLevel
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
                name,
                text,
                isMenu,
                icon,
                permissionLevel,
                parentMenuId
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: '菜单名称',
                    value: text,
                    rules: { max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名菜单
            const data = await MenuModel.isExist({
                $or: {
                    name,
                    text
                }
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: '菜单名称或标识符已存在' })
                return
            }

            const temp = {}
            if (name !== undefined || name !== null) {
                temp.icon = name
            }
            if (isMenu !== undefined || isMenu !== null) {
                temp.isMenu = isMenu === 'true'
            }
            if (icon !== undefined || icon !== null) {
                temp.icon = icon
            }
            if (permissionLevel !== undefined || permissionLevel !== null) {
                temp.permissionLevel = permissionLevel
            }
            if (parentMenuId !== undefined || parentMenuId !== null) {
                temp.parentMenuId = parentMenuId
            }

            // 执行写入
            await MenuModel.add({
                name,
                text,
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
                name,
                text,
                isMenu,
                icon,
                permissionLevel,
                parentMenuId
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: 'id',
                    value: id,
                    rules: { required: true }
                },
                {
                    msgLabel: '菜单名称',
                    value: text,
                    rules: { max: 10 }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await MenuModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 查询是否存在同名菜单
            data = await MenuModel.isExist({
                $or: {
                    name,
                    text
                }
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: '菜单名称或标识符已存在' })
                return
            }

            const temp = {}
            if (isMenu !== undefined || isMenu !== null) {
                temp.isMenu = isMenu === 'true'
            }
            if (icon !== undefined || icon !== null) {
                temp.icon = icon
            }
            if (permissionLevel !== undefined || permissionLevel !== null) {
                temp.permissionLevel = permissionLevel
            }
            if (parentMenuId !== undefined || parentMenuId !== null) {
                temp.parentMenuId = parentMenuId
            }

            // 执行写入
            await MenuModel.edit({
                name,
                text,
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
            const data = await MenuModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该数据已不存在' })
                return
            }

            // 执行写入
            await MenuModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = MenuController
