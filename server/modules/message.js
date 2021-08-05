// 引入mysql的配置文件
const db = require('../../config/db')

// 引入sequelize对象
const Sequelize = require('sequelize')
const Op = Sequelize.Op

// 引入数据表模型
const Message = db.sequelize.import('../schema/message')
// const User = db.sequelize.import('../schema/user')
// User.hasMany(Message)
// Message.belongsTo(User)
// 引入默认数据
const defaultData = require('../defaults/message')

// 自动创建表 `force: true` 表存在时先删除表
Message.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Message.bulkCreate(defaultData)
})

class MessageModel {
    // 查询列表
    static async list(params) {
        // 分页相关参数
        const pager = {}
        pager.page = Number(params.page || 1)
        pager.limit = Number(params.limit || 10)
        pager.orderby = params.orderby || 'desc'
        pager.orderName = params.orderName || 'updatedAt'

        // 查找条件
        const conditions = {}
        // 查找条件
        if (String(params.isEqual) === 'true' && params.content) {
            // 名称精确查找
            conditions.content = params.content
        } else if (params.content) {
            // 名称包含查找
            conditions.content = {
                [Op.substring]: params.content
            }
        }

        return await Message.findAndCountAll({
            limit: pager.limit,
            offset: (pager.page - 1) * pager.limit,
            where: conditions,
            order: [
                [pager.orderName, pager.orderby]
            ]
        })
    }

    // 查询单条数据
    static async findOne(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.content) {
            conditions.content = params.content
        }

        return await Message.findOne({
            where: conditions
        })
    }

    // 数据插入
    static async add(params) {
        return await Message.create({
            content: params.content
        })
    }

    // 数据编辑
    static async edit(params) {
        return await Message.update({
            content: params.content
        }, {
            where: {
                id: params.id
            }
        })
    }

    // 数据删除
    static async del(params) {
        return await Message.destroy({
            where: {
                id: params.id
            }
        })
    }
}

module.exports = MessageModel
