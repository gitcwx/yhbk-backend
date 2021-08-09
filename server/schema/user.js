const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        username: {
            comment: '用户名',
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            comment: '密码',
            type: DataTypes.STRING,
            allowNull: false
        },
        salt: {
            comment: '盐',
            type: DataTypes.STRING,
            allowNull: false
        },
        ip: {
            comment: '用户ip',
            type: DataTypes.STRING,
            allowNull: true
        },
        lastLoginAt: {
            comment: '上次登录时间',
            type: DataTypes.DATE,
            allowNull: true,
            get() {
                return moment(this.getDataValue('lastLoginAt')).format('YYYY-MM-DD HH:mm:ss')
            }
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

    User.associate = models => {

    }

    return User
}
