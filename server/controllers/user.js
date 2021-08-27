const {
    UserModel,
    ArticleModel
} = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
// 引入md5加密方法
const { MD5 } = require('../../util/encrypt')
// token
const jwt = require('jsonwebtoken')
const { token } = require('../../config')
class UserController {
    // 用户列表
    static async list(ctx) {
        try {
            const {
                username,
                nickname,
                gender,
                status,
                loginFrom,
                permissionLevel
            } = ctx.request.body
            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                ['username', 'nickname', 'birth', 'lastLoginAt', 'updatedAt'] // can order list
            )
            if (checkPage.mistake) {
                throwError(ctx, 'rules', checkPage.mistake)
                return
            }
            // 查询条件参数过滤重组
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'username', value: username, rewrite: { $like: `%${username}%` } },
                { rename: 'nickname', value: nickname, rewrite: { $like: `%${nickname}%` } },
                { rename: 'gender', value: gender },
                { rename: 'status', value: status },
                { rename: 'loginFrom', value: loginFrom },
                { rename: 'permissionLevel', value: permissionLevel }
            ], 'read')

            const result = await UserModel.list({
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

    // 用户信息
    static async info(ctx) {
        const { id } = ctx.request.body
        let userId
        if (id) {
            userId = id
        } else {
            const auth = ctx.request.headers.authorization.replace('Bearer ', '')
            userId = await jwt.verify(auth, token.key).id
        }

        const data = await UserModel.info(userId)
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
            const {
                username,
                password
            } = ctx.request.body
            const ip = headers['x-forwarded-for'] || headers['x-real-ip']

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                {
                    label: '用户名',
                    value: username,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }
                },
                {
                    label: '密码',
                    value: password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ], 'read')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询用户是否存在
            const data = await UserModel.isExist({
                username
            })
            if (!data) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误' })
                return
            }
            const secret = await MD5(password, data.salt)
            if (data.password !== secret) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误' })
                return
            }

            await UserModel.login(data, ip)
            throwSuccess(ctx, {
                msg: '登录成功',
                token: jwt.sign(
                    { id: data.id, username: data.username },
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

    // todo 新增用户 参数待补全
    static async add(ctx, next, isRegister) {
        try {
            const {
                username,
                password
            } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                {
                    label: '登录名',
                    value: username,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{4,16}$/ }
                },
                {
                    label: '密码',
                    value: password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
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
                        { id: data.id, username: data.username },
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
            const {
                id,
                password,
                newPassword
            } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                {
                    label: '用户id',
                    value: id,
                    rules: { required: true }
                },
                {
                    label: '原始密码',
                    value: password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                },
                {
                    label: '新密码',
                    value: newPassword,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{4,16}$/ }
                }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 检查原密码是否正确
            const secret = await MD5(password, data.salt)
            if (data.password !== secret) {
                throwError(ctx, 'notMatch', { msg: '原密码错误' })
                return
            }

            // 执行写入
            await UserModel.password({
                newPassword
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
            const checkParams = checkRuleAndfilterEmpty([
                { value: id, label: 'ID', rules: { required: true } },
                { rename: 'nickname', value: nickname, label: '昵称', rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,16}$/ } },
                { rename: 'birth', value: birth, label: '生日', rules: { reg: /^\d{4}-\d{2}-\d{2}$/ } },
                { rename: 'gender', value: gender, label: '性别', rules: { reg: /^[012]$/ } },
                { rename: 'location', value: location, label: '省市县区', rules: { reg: /^\d{6}-\d{6}-\d{6}$/ } },
                { rename: 'email', value: email, label: '邮箱', rules: { reg: /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ } },
                { rename: 'phone', value: phone, label: '手机号', rules: { reg: /^1[3-9]\d{9}$/ } },
                { rename: 'status', value: status, label: '用户状态', rules: { reg: /^[123]$/ } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 执行写入
            await UserModel.edit(checkParams.data, {
                id
            })
            // 获取用户更新后的信息
            data = await UserModel.info(id)
            // 更新文章
            await ArticleModel.edit({
                author: data
            }, {
                authorId: id
            })
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
            const checkParams = checkRuleAndfilterEmpty([
                { label: 'ID', value: id, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在' })
                return
            }

            // 查询分类下面有没有文章
            data = await ArticleModel.isExist({ authorId: id })
            if (data) {
                throwError(ctx, 'isExist', { msg: '该用户下存在文章，不可删除' })
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
