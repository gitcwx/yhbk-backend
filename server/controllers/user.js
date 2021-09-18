const { UserModel, ArticleModel } = require('../model')
const { throwSuccess, throwError, checkPageAndRewrite, checkRuleAndfilterEmpty } = require('../common/response')
// 引入md5加密方法
const { UUID, MD5 } = require('../../util/encrypt')
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
                from,
                permissionLevel
            } = ctx.request.body
            // 参数规则检测
            const checkPage = checkPageAndRewrite(
                ctx.request.body,
                // 允许排序的字段
                ['username', 'nickname', 'birth', 'lastLoginAt', 'updatedAt']
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
                { rename: 'from', value: from },
                { rename: 'permissionLevel', value: permissionLevel }
            ], 'read')

            const result = await UserModel.list({
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
            throwError(ctx, 'notExist', { msg: '该用户不存在', msgEn: 'The User Is Already Not Exist' })
            return
        }
        throwSuccess(ctx, {
            msg: '查询成功',
            msgEn: 'Query Success',
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
                    rename: 'username',
                    label: '用户名',
                    labelEn: 'Username',
                    value: username,
                    rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/ }
                },
                {
                    rename: 'password',
                    label: '密码',
                    labelEn: 'Password',
                    value: password,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{6,16}$/ }
                }
            ], 'read')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询用户是否存在
            const data = await UserModel.isExist({ username })
            if (!data) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误', msgEn: 'Username Or Password Is Incorrect' })
                return
            }
            const secret = await MD5(password, data.salt)
            if (data.password !== secret) {
                throwError(ctx, 'notMatch', { msg: '用户名或者密码错误', msgEn: 'Username Or Password Is Incorrect' })
                return
            }
            // 账户已禁用
            if (data.status === '2') {
                throwError(ctx, 'forbidden', { msg: '账户已冻结，请联系管理员', msgEn: 'Account Is Frozen, Please Contact The Master' })
                return
            }

            await UserModel.login(data, ip)
            throwSuccess(ctx, {
                msg: '登录成功',
                msgEn: 'Login Success',
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
    static async register(ctx) {
        try {
            const {
                username,
                password
            } = ctx.request.body
            const salt = UUID()

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'username', value: username, label: '登录名', labelEn: 'Username', rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/ } },
                {
                    rename: 'password',
                    value: password,
                    label: '密码',
                    labelEn: 'Password',
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{6,16}$/ },
                    rewrite: await MD5(password, salt)
                },
                { rename: 'nickname', value: username, rewrite: username },
                { rename: 'salt', value: password, rewrite: salt }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }
            // 查询登录名是否存在
            let data = await UserModel.isExist({ username })
            if (data) {
                throwError(ctx, 'isExist', { msg: '登录名已存在', msgEn: 'Username Is Already Exist' })
                return
            }

            // 执行写入
            data = await UserModel.add(checkParams.data)
            throwSuccess(ctx, {
                msg: '注册成功',
                msgEn: 'Register Success',
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

    // todo 新增用户 参数待补全
    static async add(ctx) {
        try {
            const {
                username,
                password,
                nickname,
                birth,
                gender,
                location,
                email,
                phone,
                status,
                avatar,
                motto,
                permissionLevel
            } = ctx.request.body
            const salt = UUID()

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { rename: 'username', value: username, label: '登录名', labelEn: 'Username', rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/ } },
                {
                    rename: 'password',
                    value: password,
                    label: '密码',
                    labelEn: 'Password',
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{6,16}$/ },
                    rewrite: await MD5(password, salt)
                },
                { rename: 'salt', value: password, rewrite: salt },
                {
                    rename: 'nickname',
                    value: nickname,
                    label: '昵称',
                    labelEn: 'Nickname',
                    rules: { reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/ },
                    rewrite: nickname || username
                },
                { rename: 'birth', value: birth, label: '生日', labelEn: 'Birthday', rules: { reg: /^\d{4}-\d{2}-\d{2}$/ } },
                { rename: 'gender', value: gender, label: '性别', labelEn: 'Gender', rules: { reg: /^[012]$/ } },
                { rename: 'location', value: location, label: '省市县区', labelEn: 'Location', rules: { reg: /^\d{6}-\d{6}-\d{6}$/ } },
                { rename: 'email', value: email, label: '邮箱', labelEn: 'Email', rules: { reg: /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ } },
                { rename: 'phone', value: phone, label: '手机号', labelEn: 'Contact', rules: { reg: /^1[3-9]\d{9}$/ } },
                { rename: 'status', value: status, label: '用户状态', labelEn: 'User Status', rules: { reg: /^[123]$/ } },
                { rename: 'avatar', value: avatar },
                { rename: 'motto', value: motto, label: '个性签名', labelEn: 'User Motto', rules: { max: 100 } },
                { rename: 'permissionLevel', value: permissionLevel, label: '用户权限', labelEn: 'User Permission', rules: { reg: /^\d$/ } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            const auth = ctx.request.headers.authorization.replace('Bearer ', '')
            const userId = await jwt.verify(auth, token.key).id
            const userInfo = await UserModel.info(userId)

            // 调整权限
            if (!isNaN(permissionLevel)) {
                if (permissionLevel <= userInfo.permissionLevel) {
                    throwError(ctx, 'forbidden', { msg: '无法赋予高于自身的权限', msgEn: 'You Can Not Set A Higher Permission Than Your\'s' })
                    return
                }
            }
            // 查询登录名是否存在
            let data = await UserModel.isExist({ username })
            if (data) {
                throwError(ctx, 'isExist', { msg: '登录名已存在', msgEn: 'Username Is Already Exist' })
                return
            }

            // 执行写入
            data = await UserModel.add(checkParams.data)

            throwSuccess(ctx, {
                msg: '新增成功',
                msgEn: 'Add Success'
            })
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
                    rename: 'id',
                    label: '用户id',
                    labelEn: 'UserId',
                    value: id,
                    rules: { required: true }
                },
                {
                    rename: 'password',
                    label: '原始密码',
                    labelEn: 'Old Password',
                    value: password,
                    rules: { reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{6,16}$/ }
                },
                {
                    rename: 'newPassword',
                    label: '新密码',
                    labelEn: 'new Password',
                    value: newPassword,
                    rules: { required: true, reg: /^[a-zA-Z0-9~!@#$%^&*()+=|{}\-_]{6,16}$/ }
                }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            const data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在', msgEn: 'The User Is Already Not Exist' })
                return
            }

            const auth = ctx.request.headers.authorization.replace('Bearer ', '')
            const userId = await jwt.verify(auth, token.key).id
            const userInfo = await UserModel.info(userId)
            // 修改自己的密码需要提供原始密码
            if (id === userInfo.id && !password) {
                throwError(ctx, 'forbidden', { msg: '请输入原始密码', msgEn: 'Please Provide Old Password' })
                return
            }
            // 检测自身权限是否可以修改其他人信息
            if (id !== userInfo.id && data.permissionLevel <= userInfo.permissionLevel) {
                throwError(ctx, 'forbidden', { msg: '无法修改更高级用户信息', msgEn: 'You Can Not Edit A Higher Permission User' })
                return
            }

            // 检查原密码是否正确
            const secret = await MD5(password, data.salt)
            if (data.password !== secret) {
                throwError(ctx, 'notMatch', { msg: '原密码错误', msgEn: 'Old Password Is Incorrect' })
                return
            }

            // 执行写入
            await UserModel.password({
                newPassword
            }, {
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
                status,
                avatar,
                motto,
                permissionLevel
            } = ctx.request.body

            // 参数规则检测
            const checkParams = checkRuleAndfilterEmpty([
                { value: id, label: 'ID', rules: { required: true } },
                { rename: 'nickname', value: nickname, label: '昵称', labelEn: 'Nickname', rules: { required: true, reg: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/ } },
                { rename: 'birth', value: birth, label: '生日', labelEn: 'Birthday', rules: { reg: /^\d{4}-\d{2}-\d{2}$/ } },
                { rename: 'gender', value: gender, label: '性别', labelEn: 'Gender', rules: { reg: /^[012]$/ } },
                { rename: 'location', value: location, label: '省市县区', labelEn: 'Location', rules: { reg: /^\d{6}-\d{6}-\d{6}$/ } },
                { rename: 'email', value: email, label: '邮箱', labelEn: 'Email', rules: { reg: /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ } },
                { rename: 'phone', value: phone, label: '手机号', labelEn: 'Contact', rules: { reg: /^1[3-9]\d{9}$/ } },
                { rename: 'status', value: status, label: '用户状态', labelEn: 'User Status', rules: { reg: /^[123]$/ } },
                { rename: 'avatar', value: avatar },
                { rename: 'motto', value: motto, rules: { max: 100 } },
                { rename: 'permissionLevel', value: permissionLevel, rules: { reg: /^\d$/ } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            const auth = ctx.request.headers.authorization.replace('Bearer ', '')
            const userId = await jwt.verify(auth, token.key).id
            const userInfo = await UserModel.info(userId)

            // 调整权限
            if (!isNaN(permissionLevel)) {
                // 调整自身权限
                if (id === userInfo.id) {
                    if (permissionLevel < userInfo.permissionLevel) {
                        throwError(ctx, 'forbidden', { msg: '无法提升自身的权限', msgEn: 'You Can Not Improve Your Permission By Yourself' })
                        return
                    }
                // 调整其他用户权限
                } else if (permissionLevel <= userInfo.permissionLevel) {
                    throwError(ctx, 'forbidden', { msg: '无法赋予高于自身的权限', msgEn: 'You Can Not Set A Higher Permission Than Your\'s' })
                    return
                }
            }

            // 查询是否存在
            let data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在', msgEn: 'The User Is Already Not Exist' })
                return
            }

            // 检测自身权限是否可以修改其他人信息
            if (id !== userInfo.id && data.permissionLevel <= userInfo.permissionLevel) {
                throwError(ctx, 'forbidden', { msg: '无法修改更高级用户信息', msgEn: 'You Can Not Edit A Higher Permission User' })
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
                msg: '修改成功',
                msgEn: 'Modify Success'
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
                { label: 'ID', labelEn: 'ID', value: id, rules: { required: true } }
            ], 'write')
            if (checkParams.mistake) {
                throwError(ctx, 'rules', checkParams.mistake)
                return
            }

            // 查询是否存在
            let data = await UserModel.isExist({ id })
            if (!data) {
                throwError(ctx, 'notExist', { msg: '该用户不存在', msgEn: 'The User Is Already Not Exist' })
                return
            }

            const auth = ctx.request.headers.authorization.replace('Bearer ', '')
            const userId = await jwt.verify(auth, token.key).id
            const userInfo = await UserModel.info(userId)
            // 检测自身权限是否可以修改其他人信息
            if (id !== userInfo.id && data.permissionLevel <= userInfo.permissionLevel) {
                throwError(ctx, 'forbidden', { msg: '无法删除更高级用户', msgEn: 'You Can Not Delete A Higher Permission User' })
                return
            }

            // 查询分类下面有没有文章
            data = await ArticleModel.isExist({ authorId: id })
            if (data) {
                throwError(ctx, 'isExist', { msg: '该用户下存在文章，不可删除', msgEn: 'Deletion Failed Because Of There Are Articles In Name Of This User' })
                return
            }

            // 执行写入
            await UserModel.del(id)
            throwSuccess(ctx, {
                msg: '删除成功',
                msgEn: 'Delete Success'
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = UserController
