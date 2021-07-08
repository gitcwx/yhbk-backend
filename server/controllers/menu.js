const MenuModel = require("../modules/menu");

class MenuController {
  /**
   * 获取菜单列表
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async menulist(ctx) {
    try {
      // 查询菜单列表模型
      let data = await MenuModel.getMenuList();
      ctx.response.status = 200;
      ctx.body = {
        statusCode: "00",
        msg: "查询成功",
        data,
      };
    } catch (err) {
      ctx.response.status = 412;
      ctx.body = {
        statusCode: "99",
        msg: "查询失败",
      };
    }
  }

  /**
   * 新增项
   */
  static async create(ctx) {
    //接收客户端
    let req = ctx.request.body; // {a: 1, b: 2}
    if (req.a) {
      ctx.response.status = 416;
      ctx.body = {
        code: 200,
        msg: "a is required"
      };
      return;
    }
    if (req.b) {
      ctx.response.status = 416;
      ctx.body = {
        code: 200,
        msg: "b is required"
      };
      return;
    }
    try {
      //创建xxx模型
      const ret = await XxxModel.createXxx(req);
      //使用刚刚创建的ID查询，且返回详情信息
      const data = await XxxModel.getXxxDetail(ret.id);

      ctx.response.status = 200;
      ctx.body = {
        code: 200,
        msg: "创建成功",
        data,
      };
    } catch (err) {
      ctx.response.status = 412;
      ctx.body = {
        code: 412,
        msg: "创建失败",
        data: err,
      };
    }
  }
}

module.exports = MenuController;
