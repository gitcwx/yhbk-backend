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
        parentId: {
            comment: '父级评论ID',
            type: DataTypes.UUID,
            allowNull: true
        },
        articleId: {
            comment: '文章ID',
            type: DataTypes.UUID,
            allowNull: false
        },
        userId: {
            comment: '用户ID',
            type: DataTypes.UUID,
            allowNull: false
        },
        content: {
            comment: '评论内容',
            type: DataTypes.TEXT,
            allowNull: false
        },
        forbid: {
            comment: '是否违规',
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
                const value = this.getDataValue('deletedAt')
                return value ? moment(this.getDataValue('deletedAt')).format('YYYY-MM-DD HH:mm:ss') : null
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
