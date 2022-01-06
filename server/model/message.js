const {
    message: Message
} = require('../schema')

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
        const {
            page,
            limit,
            orderby,
            orderName
        } = params

        return await Message.findAndCountAll({
            attributes: {
                exclude: ['deletedAt']
            },
            limit,
            offset: (page - 1) * limit,
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 数据插入
    static async add(params) {
        return await Message.create(params)
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Message.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Message.destroy({
            where: {
                id
            }
        })
    }

    // 删除子数据
    static async delChild(parentId) {
        return await Message.destroy({
            where: {
                parentId
            }
        })
    }

    // 查询数据是否存在
    static async isExist(conditions) {
        return await Message.findOne({
            where: conditions
        })
    }
}

module.exports = MessageModel
