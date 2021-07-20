// 引入mysql的配置文件
const db = require("../../config/db")

// 引入sequelize对象
const Sequelize = require("sequelize")
const Op = Sequelize.Op

// 引入md5加密方法
const { UUID, MD5 } = require('../../util/encrypt')

// 引入数据表模型
const User = db.sequelize.import("../schema/user")

// 引入默认数据
const defaultData = require("../defaults/user")

// 自动创建表 `force: true` 表存在时先删除表
User.sync({ force: true }).then(() => {
    // 默认数据写入表
    return User.bulkCreate(defaultData)
});

class UserModel {
    // 查询列表
    static async list(params) {
        // 过滤参数
        const filters = {}
        // 常驻参数
        filters.page = Number(params.page || 1)
        filters.limit = Number(params.limit || 10)
        filters.orderby = params.orderby || 'desc'
        filters.orderName = params.orderName || 'createdAt'
        // 条件参数
        if (params.id) { filters.id = params.id }
        if (params.userName) { filters.userName = params.userName }
        if (params.isEqual) { filters.isEqual = String(params.isEqual) === 'true' }
        
        // 查找条件
        let conditions = {}
        if (filters.id) {
            // id精确查找
            conditions.id = filters.id
        } else if (filters.isEqual && filters.userName) {
            // 名称精确查找
            conditions.userName = filters.userName
        } else if (filters.userName) {
            // 名称包含查找
            conditions.userName = {
                [Op.substring]: filters.userName
            }
        }
        
        return await User.findAll({
            attributes: ['id', 'userName', 'lastLoginAt', 'createdAt'],
            limit: filters.limit,
            offset: (filters.page - 1) * filters.limit,
            where: conditions,
            order: [
                [filters.orderName, filters.orderby]
            ]
        })
    }

    // 查找用户
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
        });
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
        });
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
        });
    }

    // 数据删除
    static async del(params) {
        return await User.destroy({
            where: {
                id: params.id
            }
        });
    }
}

module.exports = UserModel;
