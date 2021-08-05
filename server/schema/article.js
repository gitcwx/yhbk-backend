const { gzipSync, gunzipSync } = require('zlib')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('article', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 文章标题
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'title'
        },
        // 文章内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content',
            // 内容压缩
            get() {
                const storedValue = this.getDataValue('content')
                const gzippedBuffer = Buffer.from(storedValue, 'base64')
                const unzippedBuffer = gunzipSync(gzippedBuffer)
                return unzippedBuffer.toString()
            },
            set(value) {
                const gzippedBuffer = gzipSync(value)
                this.setDataValue('content', gzippedBuffer.toString('base64'))
            }
        },
        // 文章分类
        categoryId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'categoryId'
        },
        // 文章分类名称
        categoryName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'categoryName'
        },
        // 文章标签
        tagIds: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'tagIds'
        },
        // 文章标签名称
        tagNames: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'tagNames'
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
        // 软删除
        paranoid: true,
        // 表名与modal名相同
        freezeTableName: true
    })
}
