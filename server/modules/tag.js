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
        // 分页相关参数
        const pager = {}
        pager.page = Number(params.page || 1)
        pager.limit = Number(params.limit || 10)
        pager.orderby = params.orderby || 'desc'
        pager.orderName = params.orderName || 'updatedAt'

        // 查找条件
        let conditions = {}
        // 查找条件
        if (String(params.isEqual) === 'true' && params.tagName) {
            // 名称精确查找
            conditions.tagName = params.tagName
        } else if (params.tagName) {
            // 名称包含查找
            conditions.tagName = {
                [Op.substring]: params.tagName
            }
        }

        return await Tag.findAll({
            limit: pager.limit,
            offset:  (pager.page - 1) * pager.limit,
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
        if (params.tagName) {
            conditions.tagName = params.tagName
        }
        
        return await Tag.findOne({
            where: conditions
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
    static async del(params) {
        return await Tag.destroy({
            where: {
                id: params.id
            }
        });
    }
}

module.exports = TagModel;
