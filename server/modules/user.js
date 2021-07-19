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
        filters.orderName = params.orderName || 'updatedAt'
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
            limit: filters.limit,
            offset: (filters.page - 1) * filters.limit,
            where: conditions,
            order: [
                [filters.orderName, filters.orderby]
            ]
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

    // 数据编辑
    static async edit(params) {
        return await User.update({
            userName: params.userName
        }, {
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
