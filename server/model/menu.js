const {
    menu: Menu
} = require('../schema')

// 引入默认数据
const defaultData = require('../defaults/menu')

// 自动创建表 `force: true` 表存在时先删除表
Menu.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Menu.bulkCreate(defaultData)
})

class MenuModel {
    // 查询列表
    static async list(params) {
        const {
            page,
            limit,
            orderby,
            orderName,
            text,
            permissionLevel
        } = params

        return await Menu.findAndCountAll({
            attributes: { exclude: ['deletedAt'] },
            limit,
            offset: (page - 1) * limit,
            where: {
                text: {
                    $like: `%${text}%`
                },
                permissionLevel: {
                    $gte: permissionLevel
                }
            },
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 数据插入
    static async add(params) {
        return await Menu.create(params)
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Menu.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Menu.destroy({
            where: {
                id
            }
        })
    }

    // 查询是否存在相同数据
    static async isExist(conditions) {
        return await Menu.findOne({
            where: conditions
        })
    }
}

module.exports = MenuModel
