const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Category = sequelize.define('category', {
        id: {
            comment: '主键ID',
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            comment: '分类名称',
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        nameEn: {
            comment: 'Category Name',
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
                const value = this.getDataValue('deletedAt')
                return value ? moment(this.getDataValue('deletedAt')).format('YYYY-MM-DD HH:mm:ss') : null
            }
        }
    }, {
        // 软删除
        paranoid: true,
        // 表名与model名相同
        freezeTableName: true
    })

    Category.associate = models => {

    }

    return Category
}
