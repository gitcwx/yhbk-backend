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
    static async list(params) {
        let conditions = {}
        if (params.id) {
            conditions = {
                id: params.id
            }
        } else if (params.isEqual && params.tagName) {
            conditions = {
                tagName: {
                    [Op.eq]: params.tagName
                }
            }
        } else if (params.tagName) {
            conditions = {
                tagName: {
                    [Op.substring]: params.tagName
                }
            }
        }
        let order = []
        if (params.orderName && params.orderby) {
            order = [
                [params.orderName]
            ]
        }
        return await Tag.findAll({
            limit: params.limit,
            offset:  (params.page - 1) * params.limit,
            where: conditions,
            order
        })
    }
    
    static async add(params) {
        return await Tag.create({
            tagName: params.tagName
        })
    }

    static async edit(params) {
        return await Tag.update({
            tagName: params.tagName
        }, {
            where: {
                id: params.id
            }
        });
    }

    static async del(id) {
        return await Tag.destroy({
            where: {
                id
            }
        });
    }
}

module.exports = TagModel;
