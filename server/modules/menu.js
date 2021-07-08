// 引入mysql的配置文件
const db = require('../../config/db');
 
// 引入sequelize对象
const Sequelize = db.sequelize;
 
// 引入数据表模型
const Menu = Sequelize.import('../schema/menu');

// 引入默认菜单数据
const menuData = require('../defaults/menu')

// 自动创建表 `force: true` 表存在时先删除表
Menu.sync({ force: true }).then(() => {
    // 默认菜单数据写入表
    return Menu.bulkCreate(menuData);
});
 
class MenuModel {
    /**
     * 查询菜单列表
     * @returns {Promise<Model>}
     */
    static async getMenuList(){
        return await Menu.findAll();
    }

    /**
     * 新增
     */
    static async createXxx(data){
        return await Xxx.create({
            a: data.a,
            b: data.b,
            c: data.c,
            d: data.d
        });
    }

    /**
     * 根据 id 查找
     */
    static async getXxxbyId(id){
        return await Xxx.findOne({
            where:{
                id
            }
        });
    } 
}
 
module.exports = MenuModel;