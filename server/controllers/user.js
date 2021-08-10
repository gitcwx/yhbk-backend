const {
    UserModel
} = require('../model')
const { throwSuccess, throwError, pagerVerify, paramsVerify } = require('../common/response')
// 引入md5加密方法
const { MD5 } = require('../../util/encrypt')
// token
const jwt = require('jsonwebtoken')
const { token } = require('../../config')
class UserController {
    // 用户列表
    static async list(ctx) {
        try {
            const params = ctx.request.body

            const page = Number(params.page || 1)
            const limit = Number(params.limit || 10)
            const orderby = params.orderby || 'desc'
            const orderName = params.orderName || 'updatedAt'
            const nickname = params.nickname || ''
            const gender = params.gender || ''
            const status = params.status || ''
            const loginFrom = params.loginFrom || ''

            // 参数规则检测
            const errorResponse = pagerVerify(params)
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            const result = await UserModel.list({
                page,
                limit,
                orderby,
                orderName,
                nickname,
                gender,
                status,
                loginFrom
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

    // 用户信息
    static async info(ctx) {
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

        const data = await UserModel.info(params.id)
        if (!data) {
            throwError(ctx, 'notExist', { msg: '该用户不存在' })
            return
        }
        throwSuccess(ctx, {
            msg: '查询成功',
            data
        })
    }

    // 登录
    static async login(ctx) {
        try {
            const headers = ctx.request.headers
            const params = ctx.request.body
            const ip = headers['x-forwarded-for'] || headers['x-real-ip']

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: '用户名',
                    value: params.username,
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
            const data = await UserModel.isExist({
                username: params.username
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

            await UserModel.login(data, ip)
            throwSuccess(ctx, {
                msg: '登录成功',
                token: jwt.sign(
                    { username: data.username, password: data.password, salt: data.salt },
                    token.key,
                    { expiresIn: token.expire }
                )
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }

    // 注册
    static async register(ctx, next) {
        await UserController.add(ctx, next, true)
    }

    // 新增用户
    static async add(ctx, next, isRegister) {
        try {
            const {
                username,
                password
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: '登录名',
                    value: username,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }
                },
                {
                    msgLabel: '密码',
                    value: password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询登录名是否存在
            let data = await UserModel.isExist({
                username
            })
            if (data) {
                throwError(ctx, 'isExist', { msg: '登录名已存在' })
                return
            }

            // 执行写入
            data = await UserModel.add({ username, password })
            if (isRegister) {
                throwSuccess(ctx, {
                    msg: '注册成功',
                    token: jwt.sign(
                        { username: data.username, password: data.password, salt: data.salt },
                        token.key,
                        { expiresIn: token.expire }
                    )
                })
            } else {
                throwSuccess(ctx, {
                    msg: '新增成功'
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
            const data = await UserModel.isExist({
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
    static async edit(ctx) {
        try {
            const {
                id,
                nickname,
                birth,
                gender,
                location,
                email,
                phone,
                status
            } = ctx.request.body

            // 参数规则检测
            const errorResponse = paramsVerify([
                {
                    msgLabel: 'id',
                    value: id,
                    rules: { required: true }
                },
                {
                    msgLabel: '昵称',
                    value: nickname,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,16}$/ }
                },
                {
                    msgLabel: '生日',
                    value: birth,
                    rules: { reg: /^\d{4}-\d{2}-\d{2}$/ }
                },
                {
                    msgLabel: '性别',
                    value: gender,
                    rules: { reg: /^[012]$/ }
                },
                {
                    msgLabel: '省市县区',
                    value: location,
                    rules: { reg: /^\d{6}-\d{6}-\d{6}$/ }
                },
                {
                    msgLabel: '邮箱',
                    value: email,
                    rules: { reg: /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ }
                },
                {
                    msgLabel: '手机号',
                    value: phone,
                    rules: { reg: /^1[3-9]\d{9}$/ }
                },
                {
                    msgLabel: '用户状态',
                    value: status,
                    rules: { reg: /^[123]$/ }
                }
            ])
            if (errorResponse) {
                throwError(ctx, 'rules', errorResponse)
                return
            }

            // 查询是否存在
            const data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            await UserModel.edit({
                nickname,
                birth,
                gender,
                location,
                email,
                phone,
                status
            }, id)
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
            const data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            await UserModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = UserController
