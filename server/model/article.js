const {
    article: Article
    // tag: Tag,
    // category: Category
    // comment: Comment,
    // user: User,
    // reply: Reply
    // sequelize
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
        const page = Number(params.page || 1)
        const limit = Number(params.limit || 10)
        const orderby = params.orderby || 'desc'
        const orderName = params.orderName || 'updatedAt'
        const keyword = params.keyword || ''

        return await Article.findAll({
            limit: Number(limit),
            offset: (page - 1) * limit,
            where: {
                $or: {
                    title: {
                        $like: `%${keyword}%`
                    }
                    // content已经转base64 暂时无法查找
                    // content: {
                    //     $like: `%${keyword}%`
                    // }
                }
            },
            order: [
                [orderName, orderby]
            ]
        })
    }

    // 文章详情
    static async detail(id) {
        return await Article.findOne({
            where: {
                id
            }
        })
    }

    // 数据插入
    static async add(params) {
        const tags = params.tagIds ? params.tagIds.split(',').map(v => ({ name: v })) : []
        return await Article.create({
            title: params.title,
            content: params.content,
            authorId: params.authorId,
            category: { name: params.categoryId },
            tags,
            isTop: params.isTop === 'true'
        })
    }

    // 数据编辑
    static async edit(params, articleId) {
        const newData = {}
        if (params.title !== undefined) {
            newData.title = params.title
        }
        if (params.content !== undefined) {
            newData.content = params.content
        }
        if (params.isTop !== undefined) {
            newData.isTop = params.isTop === 'true'
        }
        await Article.update(newData, {
            where: {
                id: articleId
            }
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
    static async isExist(params) {
        const conditions = {}
        if (params.id) {
            conditions.id = params.id
        }
        if (params.title) {
            conditions.title = params.title
        }

        return await Article.findOne({
            where: conditions
        })
    }
}

module.exports = ArticleModel
