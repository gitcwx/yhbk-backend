// 引入mysql的配置文件
const db = require('../../config/db')

// 引入sequelize对象
const Sequelize = require('sequelize')
const Op = Sequelize.Op

// 引入数据表模型
const Article = db.sequelize.import('../schema/article')

// 引入默认数据
const defaultData = require('../defaults/article')

// 自动创建表 `force: true` 表存在时先删除表
Article.sync({ force: true }).then(() => {
    // 默认数据写入表
    return Article.bulkCreate(defaultData)
})

class ArticleModel {
    // 查询列表
    static async list(params) {
        // 分页相关参数
        const pager = {}
        pager.page = Number(params.page || 1)
        pager.limit = Number(params.limit || 10)
        pager.orderby = params.orderby || 'desc'
        pager.orderName = params.orderName || 'updatedAt'

        // 查找条件
        const conditions = {}
        if (String(params.isEqual) === 'true' && params.articleName) {
            // 名称精确查找
            conditions.articleName = params.articleName
        } else if (params.articleName) {
            // 名称包含查找
            conditions.articleName = {
                [Op.substring]: params.articleName
            }
        }
        if (params.categoryId) {
            conditions.categoryId = params.categoryId
        }
        if (params.tags) {
            conditions.tags = {
                [Op.or]: params.tags.split(',')
            }
        }

        return await Article.findAll({
            limit: pager.limit,
            offset: (pager.page - 1) * pager.limit,
            where: conditions,
            order: [
                [pager.orderName, pager.orderby]
            ]
        })
    }

    // 单项查找
    static async findOne(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.articleName) {
            conditions.articleName = params.articleName
        }

        return await Article.findOne({
            where: conditions
        })
    }

    // 数据插入
    static async add(params) {
        return await Article.create({
            articleName: params.articleName
        })
    }

    // 数据编辑
    static async edit(params) {
        return await Article.update({
            articleName: params.articleName
        }, {
            where: {
                id: params.id
            }
        })
    }

    // 数据删除
    static async del(params) {
        return await Article.destroy({
            where: {
                id: params.id
            }
        })
    }
}

module.exports = ArticleModel