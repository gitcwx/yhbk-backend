const UserModel = require('../modules/user')
const { throwSuccess, throwError, checkRules } = require('../common/response')

class UserController {
    static async list(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.list(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const data = await UserModel.list(params)

            throwSuccess(ctx, {
                msg: "查询成功",
                data
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async add(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = 
                checkRules.input('用户名', params.userName, { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }) ||
                checkRules.input('密码', params.password, { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ })
            
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }
            
            // 查询是否存在同名标签
            let data = await UserModel.list({
                userName: params.userName,
                isEqual: true
            })
            
            if (data.length) {
                throwError(ctx, 'isExist', { msg: '用户名已存在' })
                return
            }
            
            // 执行写入
            const item = await UserModel.add(params)
            //使用刚刚创建的ID查询，且返回详情信息
            data = await UserModel.list({
                id: item.id
            })

            throwSuccess(ctx, {
                msg: "添加成功",
                data: data[0]
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async edit(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse =
                checkRules.input('id', params.id, { required: true }) ||
                checkRules.input('标签名', params.userName, { required: true, max: 10 })

            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在同名
            let data = await UserModel.list({
                userName: params.userName,
                isEqual: true
            })
            if (data.length) {
                throwError(ctx, 'isExist', { msg: '用户名已存在' })
                return
            }

            // 查询是否存在
            data = await UserModel.list({
                id: params.id
            })
            if (data.length === 0) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            const item = await UserModel.edit(params)
            data = await UserModel.list({
                id: item.id
            })

            throwSuccess(ctx, {
                msg: "修改成功",
                data: data[0]
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    static async del(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.input('id', params.id, { required: true })

            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await UserModel.list({
                id: params.id
            })
            if (data.length === 0) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            await UserModel.del({
                id: params.id
            })

            throwSuccess(ctx, {
                msg: "删除成功"
            })

        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = UserController
