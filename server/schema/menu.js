module.exports = function(sequelize,DataTypes){
    return sequelize.define('menu',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true
        },
        //菜单id
        menuId:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'menuId'
        },
        //菜单名称
        menuName:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'menuName'
        },
        //图标
        icon:{
            type: DataTypes.STRING,
            allowNull: true,
            field:'icon'
        },
        //父级菜单id
        treeParentId:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'treeParentId'
        },
        //菜单层级
        treeLevel:{
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'treeLevel'
        },
        //指向地址
        menuUrl:{
            type: DataTypes.STRING,
            allowNull: true,
            field: 'menuUrl'
        },
        // 创建时间
        createdAt:{
            type: DataTypes.DATE
        },
        // 更新时间
        updatedAt:{
            type: DataTypes.DATE
        }
    },{
        /**
         * 如果为true，则表示名称和model相同，即user
         * 如果为fasle，mysql创建的表名称会是复数，即users
         * 如果指定的表名称本身就是复数，则形式不变
         */
        freezeTableName: true
    });
}