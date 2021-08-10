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
            comment: '登录名',
            type: DataTypes.STRING,
            allowNull: false
        },
        nickname: {
            comment: '昵称',
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
        motto: {
            comment: '个性签名',
            type: DataTypes.STRING,
            allowNull: true
        },
        birth: {
            comment: '生日',
            type: DataTypes.DATE,
            allowNull: true,
            get () {
                const value = this.getDataValue('birth')
                return value ? moment(this.getDataValue('birth')).format('YYYY-MM-DD') : null
            }
        },
        gender: {
            comment: '性别 0:未知 1:男 2:女',
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        location: {
            comment: '省市县区',
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar: {
            comment: '用户头像',
            type: DataTypes.TEXT,
            allowNull: true
        },
        email: {
            comment: '邮箱',
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            comment: '手机号',
            type: DataTypes.STRING,
            allowNull: true
        },
        ip: {
            comment: '用户ip',
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            comment: '用户状态 1:正常 2:禁言 3:冻结',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        loginFrom: {
            comment: '登录途径 0:本站注册 1:QQ授权 2: ',
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        authKey: {
            comment: '认证密钥',
            type: DataTypes.STRING,
            allowNull: true
        },
        lastLoginAt: {
            comment: '上次登录时间',
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
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
        // 表名与model名相同
        freezeTableName: true
    })

    User.associate = models => {

    }

    return User
}
