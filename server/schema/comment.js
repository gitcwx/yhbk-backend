const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Comment = sequelize.define('comment', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        articleId: {
            comment: '文章ID',
            type: DataTypes.UUID,
            allowNull: false
        },
        user: {
            comment: '评论者',
            type: DataTypes.JSON
        },
        content: {
            comment: '评论内容',
            type: DataTypes.TEXT,
            allowNull: false
        },
        likeCount: {
            comment: '点赞数',
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        commentCount: {
            comment: '评论数',
            type: DataTypes.INTEGER(11),
            defaultValue: 0
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

    Comment.associate = models => {

    }

    return Comment
}
