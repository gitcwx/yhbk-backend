const { gzipSync, gunzipSync } = require('zlib')
const moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    const Article = sequelize.define('article', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        // 文章标题
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // 文章内容
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            // 内容压缩
            get() {
                const storedValue = this.getDataValue('content')
                const gzippedBuffer = Buffer.from(storedValue, 'base64')
                const unzippedBuffer = gunzipSync(gzippedBuffer)
                return unzippedBuffer.toString()
            },
            set(value) {
                const gzippedBuffer = gzipSync(value)
                this.setDataValue('content', gzippedBuffer.toString('base64'))
            }
        },
        // 阅读数
        viewCount: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        // 置顶
        isTop: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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

    Article.associate = models => {
        // Article.hasMany(models.tag)
        // Article.hasOne(models.category)
        // Article.hasMany(models.comment)
        // Article.hasMany(models.reply)

        // Article.belongsTo(models.user, {
        //     as: 'user',
        //     foreignKey: 'userId',
        //     targetKey: 'id',
        //     constraints: false
        // })
    }

    return Article
}
