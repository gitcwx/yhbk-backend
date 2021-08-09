const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Tag = sequelize.define('tag', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            comment: '标签名称',
            type: DataTypes.STRING,
            unique: true,
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
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
            }
        }
    }, {
        // 软删除
        paranoid: true,
        // 表名与modal名相同
        freezeTableName: true
    })

    Tag.associate = models => {

    }

    return Tag
}
