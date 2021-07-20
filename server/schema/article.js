module.exports = function (sequelize, DataTypes) {
    return sequelize.define('article', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true
        },
        // 文章名称
        articleName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'articleName'
        },
        // 文章内容
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'content'
        },
        // 文章分类
        categoryId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'categoryId'
        },
        // 文章分类名称
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'categoryName'
        },
        // 文章标签
        tags: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'tags'
        },
        // 创建时间
        createdAt: {
            type: DataTypes.DATE
        },
        // 更新时间
        updatedAt: {
            type: DataTypes.DATE
        }
    }, {
        /**
         * 如果为true，则表示名称和model相同，即user
         * 如果为fasle，mysql创建的表名称会是复数，即users
         * 如果指定的表名称本身就是复数，则形式不变
         */
        freezeTableName: true
    })
}
