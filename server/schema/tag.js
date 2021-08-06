const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Tag = sequelize.define('tag', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 标签名称
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
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

    Tag.associate = models => {
        Tag.belongsTo(models.article, {
            as: 'article',
            foreignKey: 'articleId',
            targetKey: 'id',
            constraints: false
        })
    }

    return Tag
}
