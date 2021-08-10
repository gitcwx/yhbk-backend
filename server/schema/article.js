const { gzipSync, gunzipSync } = require('zlib')
const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Article = sequelize.define('article', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        title: {
            comment: '文章标题',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        cover: {
            conmment: '文章封面',
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        abstract: {
            comment: '文章摘要',
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            comment: '文章内容',
            type: DataTypes.TEXT,
            allowNull: false,
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
        viewCount: {
            comment: '阅读数',
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        likeCount: {
            comment: '点赞数',
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        isTop: {
            comment: '置顶',
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            comment: '状态 1:展示 2:不展示',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        categoryId: {
            comment: '文章分类id',
            type: DataTypes.UUID,
            allowNull: false
        },
        category: {
            comment: '文章分类',
            type: DataTypes.JSON,
            allowNull: false
        },
        tagIds: {
            comment: '文章标签id',
            type: DataTypes.TEXT,
            allowNull: false
        },
        tags: {
            comment: '文章标签',
            type: DataTypes.JSON,
            allowNull: true
        },
        authorId: {
            comment: '文章作者id',
            type: DataTypes.UUID,
            allowNull: false
        },
        author: {
            comment: '文章作者',
            type: DataTypes.JSON,
            allowNull: false
        },
        createdAt: {
            comment: '创建时间',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get() {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        updatedAt: {
            comment: '更新时间',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get() {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        deletedAt: {
            comment: '删除时间',
            type: DataTypes.DATE,
            defaultValue: null,
            get() {
                const value = this.getDataValue('birth')
                return value ? moment(this.getDataValue('birth')).format('YYYY-MM-DD') : null
            }
        }
    }, {
        // 软删除
        paranoid: true,
        // 表名与model名相同
        freezeTableName: true
    })

    Article.associate = models => {

    }

    return Article
}
