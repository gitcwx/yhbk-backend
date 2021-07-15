const TagModel = require("../modules/tag")

class TagController {
    static async list(ctx) {
        try {
            let params = ctx.request.body

            if (params.page && (isNaN(params.page) || params.page < 0)) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2001,
                    msg: "页码不合规"
                }
                return
            }

            if (params.limit && (isNaN(params.limit) || params.limit < 0)) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2002,
                    msg: "每页显示条数不合规"
                }
                return
            }

            if (!!params.orderby && ['esc', 'desc', 'ESC', 'DESC'].indexOf(params.orderby) === -1) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2003,
                    msg: "排序规则不合规"
                }
                return
            }
            
            const data = await TagModel.list({
                page: Number(params.page || 1),
                limit: Number(params.limit || 10),
                tagName: params.tagName,
                isEqual: params.isEqual === 'true',
                orderby: params.orderby || '',
                orderName: params.orderName || ''
            })

            ctx.response.status = 200
            ctx.body = {
                code: 2000,
                msg: "查询成功",
                data
            }
        } catch (err) {
            ctx.response.status = 900
            ctx.body = {
                code: 9000,
                msg: '请求失败'
            }
        }
    }

    static async add(ctx) {
        try {
            let params = ctx.request.body

            if (!params.tagName) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2001,
                    msg: "请传入标签名称"
                }
                return
            }

            if (params.tagName.length > 10) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2002,
                    msg: "标签名称过长"
                }
                return
            }

            let data = await TagModel.list({
                tagName: params.tagName,
                isEqual: true
            })

            if (data.length) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2003,
                    msg: "标签名称已存在"
                }
                return
            }
            
            const item = await TagModel.add(params)
            //使用刚刚创建的ID查询，且返回详情信息
            data = await TagModel.list({
                id: item.id
            })

            ctx.response.status = 200
            ctx.body = {
                code: 2000,
                msg: "添加成功",
                data
            }
        } catch (err) {
            ctx.response.status = 900
            ctx.body = {
                code: 9000,
                msg: '请求失败'
            }
        }
    }

    static async edit(ctx) {
        try {
            let params = ctx.request.body

            if (!params.id) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2001,
                    msg: "id不存在"
                }
                return
            }

            if (params.tagName.length > 10) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2002,
                    msg: "标签名称过长"
                }
                return
            }

            let data = await TagModel.list({
                tagName: params.tagName,
                isEqual: true
            })

            if (data.length) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2003,
                    msg: "标签名称已存在"
                }
                return
            }

            await TagModel.edit(params)
            ctx.response.status = 200
            ctx.body = {
                code: 2000,
                msg: "修改成功"
            }
        } catch (err) {
            ctx.response.status = 900
            ctx.body = {
                code: 9000,
                msg: '请求失败'
            }
        }
    }

    static async del(ctx) {
        try {
            let params = ctx.request.body

            if (!params.id) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2001,
                    msg: "id不存在"
                }
                return
            }

            let data = await TagModel.list({
                id: params.id
            })

            if (data.length === 0) {
                ctx.response.status = 200
                ctx.body = {
                    code: 2002,
                    msg: "数据不存在"
                }
                return
            }
            await TagModel.del({
                id: params.id
            })
            ctx.response.status = 200
            ctx.body = {
                code: 2000,
                msg: "删除成功"
            }

        } catch (err) {
            ctx.response.status = 900
            ctx.body = {
                code: 9000,
                msg: '请求失败'
            }
        }
    }
}

module.exports = TagController
