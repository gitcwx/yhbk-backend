module.exports = function (sequelize, DataTypes) {
    return sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true,
        },
        // 用户名
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "userName",
        },
        // 密码
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "password",
        },
        // 盐
        salt: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "salt",
        },
        // 上次登录时间
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'lastLoginAt'
        },
        // 创建时间
        createdAt: {
            type: DataTypes.DATE,
        },
        // 更新时间
        updatedAt: {
            type: DataTypes.DATE,
        }
    }, {
        /**
         * 如果为true，则表示名称和model相同，即user
         * 如果为fasle，mysql创建的表名称会是复数，即users
         * 如果指定的表名称本身就是复数，则形式不变
         */
        freezeTableName: true,
    });
};
