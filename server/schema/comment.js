const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Comment = sequelize.define('comment', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 评论内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // 创建时间
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get() {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        // 更新时间
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
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

    Comment.associate = models => {
        // Comment.belongsTo(models.article, {
        //     as: 'article',
        //     foreignKey: 'articleId',
        //     targetKey: 'id',
        //     constraints: false
        // })

        // Comment.belongsTo(models.user, {
        //     foreignKey: 'userId',
        //     targetKey: 'id',
        //     constraints: false
        // })
    }

    return Comment
}
