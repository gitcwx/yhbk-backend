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
        const {
            page,
            limit,
            orderby,
            orderName,
            name
        } = params

        return await Tag.findAndCountAll({
            attributes: { exclude: ['deletedAt'] },
            limit,
            offset: (page - 1) * limit,
            where: {
                name: {
                    $like: `%${name}%`
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
        if (params.name) {
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

    // 根据IDs查询
    static async queryByIds(ids) {
        return await Tag.findAll({
            where: {
                id: {
                    $in: ids.split(',')
                }
            }
        })
    }
}

module.exports = TagModel
