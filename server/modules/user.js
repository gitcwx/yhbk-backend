// 引入mysql的配置文件
const db = require('../../config/db')

// 引入sequelize对象
const Sequelize = require('sequelize')
const Op = Sequelize.Op

// 引入md5加密方法
const { UUID, MD5 } = require('../../util/encrypt')

// 引入数据表模型
const User = db.sequelize.import('../schema/user')

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
        // 分页相关参数
        const pager = {}
        // 常驻参数
        pager.page = Number(params.page || 1)
        pager.limit = Number(params.limit || 10)
        pager.orderby = params.orderby || 'desc'
        pager.orderName = params.orderName || 'createdAt'

        // 查找条件
        const conditions = {}
        if (String(params.isEqual) === 'true' && params.userName) {
            // 名称精确查找
            conditions.userName = params.userName
        } else if (params.userName) {
            // 名称包含查找
            conditions.userName = {
                [Op.substring]: params.userName
            }
        }

        return await User.findAndCountAll({
            attributes: ['id', 'userName', 'lastLoginAt', 'createdAt'],
            limit: pager.limit,
            offset: (pager.page - 1) * pager.limit,
            where: conditions,
            order: [
                [pager.orderName, pager.orderby]
            ]
        })
    }

    // 单项查找
    static async findOne(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.userName) {
            conditions.userName = params.userName
        }

        return await User.findOne({
            where: conditions
        })
    }

    // 登录
    static async login(params) {
        return await User.update({
            lastLoginAt: new Date()
        }, {
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
            userName: params.userName,
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
            password,
            updatedAt: new Date()
        }, {
            where: {
                id: params.id
            }
        })
    }

    // 数据编辑
    static async info(params) {
        const conditions = {}
        if (params.userName) {
            conditions.userName = params.userName
        }
        params.updatedAt = new Date()

        return await User.update(conditions, {
            where: {
                id: params.id
            }
        })
    }

    // 数据删除
    static async del(params) {
        return await User.destroy({
            where: {
                id: params.id
            }
        })
    }
}

module.exports = UserModel
