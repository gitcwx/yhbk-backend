const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Permission = sequelize.define('permission', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        isMenu: {
            comment: '是否在菜单栏显示',
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        name: {
            comment: '菜单标识符',
            type: DataTypes.STRING,
            allowNull: true
        },
        text: {
            comment: '菜单名称',
            type: DataTypes.STRING,
            allowNull: false
        },
        textEn: {
            comment: 'Menu Name',
            type: DataTypes.STRING,
            allowNull: false
        },
        icon: {
            comment: '菜单图标',
            type: DataTypes.STRING,
            defaultValue: ''
        },
        permissionLevel: {
            comment: '权限级别 0:超级管理员 1:管理员 2:普通用户 9:游客',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        parentMenuId: {
            comment: '父级菜单ID',
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: ''
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

    Permission.associate = models => {

    }

    return Permission
}
