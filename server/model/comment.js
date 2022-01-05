const {
    comment: Comment
} = require('../schema')

// 引入默认数据
const defaultData = require('../defaults/comment')

// 自动创建表 `force: true` 表存在时先删除表
Comment.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Comment.bulkCreate(defaultData)
})

class CommentModel {
    // 查询列表
    static async list(params) {
        const {
            page,
            limit,
            orderby,
            orderName,
            conditions
        } = params

        return await Comment.findAndCountAll({
            attributes: {
                exclude: ['deletedAt']
            },
            limit,
            offset: (page - 1) * limit,
            where: conditions,
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 数据插入
    static async add(params) {
        return await Comment.create(params)
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Comment.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Comment.destroy({
            where: {
                id
            }
        })
    }

    // 删除子数据
    static async delChild(parentId) {
        return await Comment.destroy({
            where: {
                parentId
            }
        })
    }

    // 查询数据是否存在
    static async isExist(conditions) {
        return await Comment.findOne({
            where: conditions
        })
    }
}

module.exports = CommentModel
