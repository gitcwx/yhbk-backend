// 引入mysql的配置文件
const db = require("../../config/db")

// 引入sequelize对象
const Sequelize = require("sequelize")
const Op = Sequelize.Op

// 引入数据表模型
const Tag = db.sequelize.import("../schema/tag")

// 引入默认数据
const defaultData = require("../defaults/tag")

// 自动创建表 `force: true` 表存在时先删除表
Tag.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Tag.bulkCreate(defaultData)
});

class TagModel {
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
        if (params.tagName) { filters.tagName = params.tagName }
        if (params.isEqual) { filters.isEqual = params.isEqual === 'true' }
        
        // 查找条件
        let conditions = {}
        if (filters.id) {
            // id精确查找
            conditions.id = filters.id
        } else if (filters.isEqual && filters.tagName) {
            // 名称精确查找
            conditions.tagName = filters.tagName
        } else if (filters.tagName) {
            // 名称包含查找
            conditions.tagName = {
                [Op.substring]: filters.tagName
            }
        }

        return await Tag.findAll({
            limit: filters.limit,
            offset:  (filters.page - 1) * filters.limit,
            where: conditions,
            order: [
                [filters.orderName, filters.orderby]
            ]
        })
    }
    
    // 数据插入
    static async add(params) {
        return await Tag.create({
            tagName: params.tagName
        })
    }

    // 数据编辑
    static async edit(params) {
        return await Tag.update({
            tagName: params.tagName
        }, {
            where: {
                id: params.id
            }
        });
    }

    // 数据删除
    static async del(id) {
        return await Tag.destroy({
            where: {
                id
            }
        });
    }
}

module.exports = TagModel;
