const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Reply = sequelize.define('reply', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        commentId: {
            comment: '评论ID',
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
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
            }
        }
    }, {
        // 软删除
        paranoid: true,
        // 表名与modal名相同
        freezeTableName: true
    })

    Reply.associate = models => {

    }

    return Reply
}
