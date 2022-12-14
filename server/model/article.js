const {
    article: Article
} = require('../schema')

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
        const {
            page,
            limit,
            orderby,
            orderName,
            conditions
        } = params

        return await Article.findAndCountAll({
            attributes: {
                exclude: ['deletedAt', 'content']
            },
            limit,
            offset: (page - 1) * limit,
            where: conditions,
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 查询指定分类/标签下文章数量
    static async count (params) {
        return await Article.count({
            where: params
        })
    }

    // 文章详情
    static async detail(id) {
        return await Article.findOne({
            attributes: { exclude: ['deletedAt'] },
            where: {
                id
            }
        })
    }

    // 数据插入
    static async add(params) {
        return await Article.create(params)
    }

    // 数据编辑
    static async edit(params, conditions) {
        return await Article.update(params, {
            where: conditions
        })
    }

    // 数据删除
    static async del(id) {
        return await Article.destroy({
            where: {
                id
            }
        })
    }

    // 查询数据是否存在
    static async isExist(conditions) {
        return await Article.findOne({
            where: conditions
        })
    }
}

module.exports = ArticleModel
