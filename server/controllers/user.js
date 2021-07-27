const UserModel = require('../modules/user')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')
// 引入md5加密方法
const { MD5 } = require('../../util/encrypt')
// token
const jwt = require('jsonwebtoken')
const { tokenKey, tokenExpiresTime } = require('../../config/token')
class UserController {
    // 注册
    static async register(ctx, next) {
        await UserController.add(ctx, next, true)
    }

    // 登录
    static async login(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
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
            const data = await UserModel.findOne({
                userName: params.userName
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '用户名或者密码错误' })
                return
            }

            const password = await MD5(params.password, data.salt)
            if (data.password !== password) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误' })
                return
            }
            const token = jwt.sign(
                { userName: data.userName, password: data.password, salt: data.salt },
                tokenKey,
                { expiresIn: tokenExpiresTime }
            )
            await UserModel.login(data)
            throwSuccess(ctx, {
                msg: '登录成功',
                data: {
                    token
                }
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 用户列表
    static async list(ctx) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await UserModel.list(params)
            throwSuccess(ctx, {
                msg: '查询成功',
                data: result.rows,
                total: result.count
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 新增用户
    static async add(ctx, next, isRegister) {
        try {
            const params = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: '用户名',
                    value: params.userName,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }
                },
                {
                    msgLabel: '密码',
                    value: params.password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询用户名是否存在
            let data = await UserModel.findOne({
                userName: params.userName
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: '用户名已存在' })
                return
            }

            // 执行写入
            data = await UserModel.add(params)
            if (isRegister) {
                const token = jwt.sign(
                    { userName: data.userName, password: data.password, salt: data.salt },
                    tokenKey,
                    { expiresIn: tokenExpiresTime }
                )
                throwSuccess(ctx, {
                    msg: '注册成功',
                    data: {
                        token
                    }
                })
            } else {
                throwSuccess(ctx, {
                    msg: '新增成功',
                    data
                })
            }
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 修改密码
    static async password (ctx) {
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
                    msgLabel: '原始密码',
                    value: params.password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                },
                {
                    msgLabel: '新密码',
                    value: params.newPassword,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            const data = await UserModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 检查原密码是否正确
            const password = await MD5(params.password, data.salt)
            if (data.password !== password) {
                throwError(ctx, 'notMatch', { msg: '原密码错误' })
                return
            }

            // 执行写入
            await UserModel.password(params)
            throwSuccess(ctx, {
                msg: '修改成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 修改用户资料
    static async info(ctx) {
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
                    msgLabel: '用户名',
                    value: params.userName,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }
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
            await UserModel.info(params)
            throwSuccess(ctx, {
                msg: '修改成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 删除用户
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
            const data = await UserModel.findOne({
                id: params.id
            })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            await UserModel.del(params)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = UserController
