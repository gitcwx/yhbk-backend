const {
    tag: Tag
    // sequelize
} = require('../schema')

// 引入默认数据
const defaultData = require('../defaults/tag')

// 自动创建表 `force: true` 表存在时先删除表
Tag.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Tag.bulkCreate(defaultData)
})

class TagModel {
    // 查询列表
    static async list(params) {
        const page = Number(params.page || 1)
        const limit = Number(params.limit || 10)
        const orderby = params.orderby || 'desc'
        const orderName = params.orderName || 'updatedAt'
        const keyword = params.keyword || ''

        return await Tag.findAndCountAll({
            limit,
            offset: (page - 1) * limit,
            where: {
                name: {
                    $like: `%${keyword}%`
                }
            },
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 数据插入
    static async add(params) {
        return await Tag.create({
            name: params.name
        })
    }

    // 数据编辑
    static async edit(params, tagId) {
        const data = {}
        if (params.name !== undefined) {
            data.name = params.name
        }
        return await Tag.update(data, {
            where: {
                id: tagId
            }
        })
    }

    // 数据删除
    static async del(id) {
        return await Tag.destroy({
            where: {
                id
            }
        })
    }

    // 查询是否存在相同数据
    static async isExist(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.name) {
            conditions.name = params.name
        }

        return await Tag.findOne({
            where: conditions
        })
    }
}

module.exports = TagModel
