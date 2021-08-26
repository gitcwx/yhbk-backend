const {
    category: Category
    // sequelize
} = require('../schema')

// 引入默认数据
const defaultData = require('../defaults/category')

// 自动创建表 `force: true` 表存在时先删除表
Category.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Category.bulkCreate(defaultData)
})

class CategoryModel {
    // 查询列表
    static async list(params) {
        const {
            page,
            limit,
            orderby,
            orderName,
            name
        } = params

        return await Category.findAndCountAll({
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
        return await Category.create({
            name: params.name
        })
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Category.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Category.destroy({
            where: {
                id
            }
        })
    }

    // 查询是否存在相同数据
    static async isExist(conditions) {
        return await Category.findOne({
            where: conditions
        })
    }
}

module.exports = CategoryModel
