const {
    user: User
    // sequelize
} = require('../schema')
// 引入md5加密方法
const { UUID, MD5 } = require('../../util/encrypt')

// 引入默认数据
const defaultData = require('../defaults/user')

// 自动创建表 `force: true` 表存在时先删除表
User.sync({ force: true }).then(() => {
    // 默认数据写入表
    return User.bulkCreate(defaultData)
})

class UserModel {
    // 查询列表
    static async list(params) {
        const {
            page,
            limit,
            orderby,
            orderName,
            nickname,
            gender,
            status,
            loginFrom
        } = params

        const conditions = {}
        if (nickname) {
            conditions.nickname = {
                $like: `%${nickname}%`
            }
        }
        if (gender) { conditions.gender = gender }
        if (status) { conditions.status = status }
        if (loginFrom) { conditions.loginFrom = loginFrom }

        return await User.findAndCountAll({
            attributes: { exclude: ['salt', 'password', 'ip', 'authKey', 'deletedAt'] },
            limit,
            offset: (page - 1) * limit,
            where: conditions,
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 查询用户信息
    static async info(id) {
        return await User.findOne({
            attributes: { exclude: ['salt', 'password', 'ip', 'authKey', 'deletedAt'] },
            where: {
                id
            }
        })
    }

    // 登录
    static async login(params, ip) {
        const data = {
            lastLoginAt: new Date()
        }
        if (ip) {
            data.ip = ip
        }
        return await User.update(data, {
            where: {
                id: params.id
            }
        })
    }

    // 数据插入
    static async add(params) {
        const salt = UUID()
        const password = await MD5(params.password, salt)

        return await User.create({
            username: params.username,
            nickname: params.username,
            password,
            salt
        })
    }

    // 修改密码
    static async password(params) {
        const salt = UUID()
        const password = await MD5(params.newPassword, salt)

        return await User.update({
            salt,
            password
        }, {
            where: {
                id: params.id
            }
        })
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await User.update(params, {
            where: conditions,
            returning: true
        })
    }

    // 数据删除
    static async del(id) {
        return await User.destroy({
            where: {
                id
            }
        })
    }

    // 查询数据是否存在
    static async isExist(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.username) {
            conditions.username = params.username
        }

        return await User.findOne({
            where: conditions
        })
    }
}

module.exports = UserModel