const { permission: Permission } = require('../schema')

// 引入默认数据
const defaultData = require('../defaults/permission')

// 自动创建表 `force: true` 表存在时先删除表
Permission.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Permission.bulkCreate(defaultData)
})

class PermissionModel {
    // 查询列表
    static async list(params) {
        const {
            page,
            limit,
            orderby,
            orderName,
            conditions
        } = params

        return await Permission.findAndCountAll({
            attributes: { exclude: ['deletedAt'] },
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
        return await Permission.create(params)
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Permission.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Permission.destroy({
            where: {
                id
            }
        })
    }

    // 查询是否存在相同数据
    static async isExist(conditions) {
        return await Permission.findOne({
            where: conditions
        })
    }
}

module.exports = PermissionModel
