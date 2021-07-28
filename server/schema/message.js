module.exports = function (sequelize, DataTypes) {
    return sequelize.define('message', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 留言内容
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'content'
        },
        // 留言人id
        userId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'userId'
        },
        // 留言人名称
        userName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'userName'
        },
        // 留言人名称
        userIp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'userIp'
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
        /**
         * 如果为true，则表示名称和model相同，即user
         * 如果为fasle，mysql创建的表名称会是复数，即users
         * 如果指定的表名称本身就是复数，则形式不变
         */
        freezeTableName: true
    })
}
