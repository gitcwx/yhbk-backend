const {
    article: Article,
    tag: Tag,
    category: Category
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

        // 查找条件
        // const userFilter = params.userId ? { id: params.userId } : null
        const tagFilter = params.tagIds ? { id: { $or: params.tagIds.split(',') } } : null
        const categoryFilter = params.categoryId ? { id: params.categoryId } : null
        console.log(categoryFilter)
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
            ],
            include: [
                { model: Tag, attributes: ['name'], where: tagFilter },
                { model: Category, attributes: ['name'], where: categoryFilter }
                // { model: User, attributes: ['username'], where: userFilter },
                // {
                //     model: Comment,
                //     attributes: ['id'],
                //     include: [{ model: Reply, attributes: ['id'] }]
                // }
            ]
        })
    }

    // 文章详情
    static async detail(id) {
        return await Article.findOne({
            where: {
                id
            },
            include: [
                { model: Tag, attributes: ['name'] },
                { model: Category, attributes: ['name'] }
                // {
                //     model: Comment,
                //     attributes: ['id', 'content', 'createdAt'],
                //     include: [
                //         {
                //             model: Reply,
                //             attributes: ['id', 'content', 'createdAt'],
                //             include: [{ model: User, as: 'user', attributes: { exclude: ['salt', 'password'] } }]
                //         },
                //         { model: User, as: 'user', attributes: { exclude: ['salt', 'password'] } }
                //     ],
                //     row: true
                // }
            ],
            order: [ // comment model order
                // [Comment, 'createdAt', 'DESC'],
                // [
                //     [Comment, Reply, 'createdAt', 'ASC']
                // ]
            ],
            row: true
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
        }, {
            include: [Tag, Category]
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

        if (params.categoryId !== undefined) {
            await Tag.destroy({ where: { articleId } })
            await Tag.bulkCreate([{ id: params.categoryId, articleId }])
        }

        if (params.tagIds !== undefined) {
            const tagList = params.tagIds.split(',').map(id => ({ id, articleId }))
            await Tag.destroy({ where: { articleId } })
            await Tag.bulkCreate(tagList)
        }
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
