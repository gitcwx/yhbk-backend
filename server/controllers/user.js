const UserModel = require('../modules/user')
const { throwSuccess, throwError, checkRules } = require('../common/response')
// 引入md5加密方法
const { UUID, MD5 } = require('../../util/encrypt')

class UserController {
    // 注册
    static async register(ctx, next) {
        await UserController.add(ctx, next, true)
    }
    // 登录
    static async login(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
                {
                    msgLabel: '用户名',
                    value: params.userName,
                    rules: { required: true }
                },
                {
                    msgLabel: '密码',
                    value: params.password,
                    rules: { required: true }
                }
            ])

            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询用户是否存在
            let data = await UserModel.findOne({
                userName: params.userName
            })
            
            if (!data) {
                throwError(ctx, 'notExist', { msg: '用户不存在' })
                return
            }
            const password = await MD5(params.password, data.salt)
            if (data.password !== password) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误' })
                return
            }
            data = await UserModel.login(data)
            throwSuccess(ctx, {
                msg: "登录成功"
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
    // 用户列表
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
    // 新增用户
    static async add(ctx, next, isRegister) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
                {
                    msgLabel: '用户名',
                    value: params.userName,
                    rules: { 
                        required: true,
                        reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/
                    }
                },
                {
                    msgLabel: '密码',
                    value: params.password,
                    rules: {
                        required: true,
                        reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/
                    }
                }
            ])
            
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询用户名是否存在
            let data = await UserModel.list({
                userName: params.userName,
                isEqual: true
            })

            if (data.length) {
                throwError(ctx, 'isExist', { msg: '用户名已存在' })
                return
            }

            // 执行写入
            await UserModel.add(params)
            throwSuccess(ctx, {
                msg: isRegister ? '注册成功' : '新增成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
    //修改密码
    static async password (ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = 
                checkRules.inputs([
                    { 
                        msgLabel: 'id',
                        value: params.id,
                        rules: { required: true }
                    },
                    {
                        msgLabel: '原始密码',
                        value: params.password,
                        rules: {
                            required: true,
                            reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/
                        }
                    },
                    {
                        msgLabel: '新密码',
                        value: params.newPassword,
                        rules: {
                            required: true,
                            reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/
                        }
                    }
                ])
            
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await UserModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 检查旧密码是否正确
            const password = await MD5(params.password, data.salt)
            if (data.password !== password) {
                throwError(ctx, 'notMatch', { msg: '原密码错误' })
                return
            }
            
            // 执行写入
            const item = await UserModel.password(params)
            throwSuccess(ctx, {
                msg: "修改成功"
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
    // 修改用户资料
    static async info(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = 
                checkRules.inputs([
                    {
                        msgLabel: 'id',
                        value: params.id,
                        rules: { required: true }
                    },
                    {
                        msgLabel: '用户名',
                        value: params.userName,
                        rules: {
                            required: true,
                            reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/
                        }
                    }
                ])
            
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            let data = await UserModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }
            
            // 查询是否存在同名
            data = await UserModel.findOne({
                userName: params.userName
            })
            
            if (data) {
                throwError(ctx, 'isExist', { msg: '用户名已存在' })
                return
            }
            
            // 执行写入
            const item = await UserModel.info(params)
            throwSuccess(ctx, {
                msg: "修改成功"
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
    // 删除用户
    static async del(ctx) {
        try {
            let params = ctx.request.body

            // 参数规则检测
            const errorResponse = checkRules.inputs([
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