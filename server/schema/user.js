const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 用户名
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // 密码
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // 盐
        salt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // 用户ip
        ip: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // 上次登录时间
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
            get() {
                return moment(this.getDataValue('lastLoginAt')).format('YYYY-MM-DD HH:mm:ss')
            }
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

    User.associate = models => {
        // User.hasMany(models.article)
        // User.hasMany(models.comment)
        // User.hasMany(models.reply)
    }

    return User
}
