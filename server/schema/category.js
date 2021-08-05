module.exports = function (sequelize, DataTypes) {
    return sequelize.define('category', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4
        },
        // 分类名称
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'categoryName'
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
