module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4
        },
        // 用户名
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'userName'
        },
        // 密码
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password'
        },
        // 盐
        salt: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'salt'
        },
        // 用户ip
        ip: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'ip'
        },
        // 上次登录时间
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'lastLoginAt'
        },
        // 创建时间
        createdAt: {
            type: DataTypes.DATE
        },
        // 更新时间
        updatedAt: {
            type: DataTypes.DATE
        }
    }, {
        // 软删除
        paranoid: true,
        // 表名与modal名相同
        freezeTableName: true
    })
}
