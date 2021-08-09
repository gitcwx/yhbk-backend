const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Reply = sequelize.define('reply', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 内容
        content: {
            type: DataTypes.STRING,
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
        },
        deletedAt: {
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
        // Reply.belongsTo(models.user, {
        //     foreignKey: 'userId',
        //     targetKey: 'id',
        //     constraints: false
        // })
    }

    return Reply
}
