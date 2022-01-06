const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Message = sequelize.define('message', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        parentId: {
            comment: '父级ID',
            type: DataTypes.UUID,
            allowNull: true
        },
        userId: {
            comment: '用户ID',
            type: DataTypes.UUID,
            allowNull: false
        },
        content: {
            comment: '留言内容',
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

    Message.associate = models => {

    }

    return Message
}
