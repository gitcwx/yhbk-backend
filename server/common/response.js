// 服务器状态码
// eslint-disable-next-line no-unused-vars
const status = {
    200: 'success',
    401: '认证失败',
    403: '权限不足',
    404: '请求资源未找到',
    405: 'token已过期',
    500: '服务器内部错误'
}
// 业务相应码
// eslint-disable-next-line no-unused-vars
const codes = {
    s00: '成功',

    // 表格 页码 排序等规则判断
    e01: '页码不合规',
    e02: '每页显示条数不合规',
    e03: '排序规则不合规',
    e04: '排序字段不合规',

    // 输入
    e11: '不可为空',
    e12: '长度不合规',
    e13: '格式不合规',

    // 数据查找
    e21: '存在相同数据',
    e22: '该数据已不存在',
    e23: '数据不匹配',

    // 服务器内部错误
    e99: '服务器内部错误'
}

// 返回成功
const throwSuccess = (ctx, params) => {
    ctx.response.status = 200
    ctx.body = {
        code: 's00',
        ...params
    }
}

// 返回错误
const throwError = (ctx, type, params) => {
    let result = {}

    switch (type) {
    // 规则错误
    case 'rules': result = { status: 200, code: params.code, msg: params.msg, msgEn: params.msgEn }; break
    // 数据库存在相同数据
    case 'isExist': result = { status: 200, code: 'e21', msg: params.msg, msgEn: params.msgEn }; break
    // 不存在该数据
    case 'notExist': result = { status: 200, code: 'e22', msg: params.msg, msgEn: params.msgEn }; break
    // 数据不匹配
    case 'notMatch': result = { status: 200, code: 'e23', msg: params.msg, msgEn: params.msgEn }; break
    // 无权修改
    case 'forbidden': result = { status: 200, code: 'e24', msg: params.msg, msgEn: params.msgEn }; break

    // token认证失败
    case 401: result = { status: 401, code: 'e81', msg: 'token认证失败', msgEn: 'Token Authorization Failed' }; break
    case 403: result = { status: 403, code: 'e83', msg: '权限不足', msgEn: 'No Permission' }; break
    case 404: result = { status: 404, code: 'e84', msg: '请求资源未找到', msgEn: '404 Mot Found' }; break
    case 405: result = { status: 405, code: 'e85', msg: 'token已过期', msgEn: 'Token Is Out Of Date' }; break
    // 其他默认500
    case 500: result = { status: 500, code: 'e99', msg: '服务器内部错误', msgEn: 'Service Error' }
    }

    ctx.response.status = result.status
    ctx.body = {
        code: result.code,
        msg: result.msg,
        msgEn: params.msgEn
    }
}

// 校验并重组分页相关参数
const checkPageAndRewrite = (params, orderKeys) => {
    let mistake
    const data = {}
    // 判断页码 page
    if (
        hasValue(params.page) &&
        !/^[1-9]\d{0,2}$/.test(params.page)
    ) {
        mistake = { code: 'e01', msg: '页码不合规', msgEn: 'Current Page Number Is Not In Reason' }
    }
    // 判断每页条数 limit
    if (
        hasValue(params.limit) &&
        !/^[1-9]\d{0,2}$/.test(params.limit)
    ) {
        mistake = { code: 'e02', msg: '每页显示条数不合规', msgEn: 'Page Limit Is Not In Reason' }
    }
    // 判断排序规则
    if (
        hasValue(params.orderby) &&
        !/^(de|a)sc$/i.test(params.orderby)
    ) {
        mistake = { code: 'e03', msg: '排序规则不合规', msgEn: 'Orderby Is Not In Reason' }
    }
    // 判断排序字段是否可用
    if (
        hasValue(params.orderName) &&
        orderKeys.indexOf(params.orderName) === -1
    ) {
        mistake = { code: 'e04', msg: '排序字段不合规', msgEn: 'OrderName Is Not In Reason' }
    }

    // 参数重组
    data.page = params.page || 1
    data.limit = params.limit || 10
    data.orderby = params.orderby ? params.orderby.toLowerCase() : 'desc'
    data.orderName = params.orderName || 'updatedAt'

    return {
        mistake,
        data
    }
}
// 校验并重组其他参数
const checkRuleAndfilterEmpty = (params, type) => {
    let mistake
    // 重组参数 [查询条件 | 存库字段]
    const data = {}
    for (let i = 0; i < params.length; i++) {
        const {
            // 规则验证参数
            label,
            labelEn,
            value,
            rules,
            // [ 重组参数 ]
            rename,
            rewrite
        } = params[i]

        // 判断是否空值
        if (
            rules &&
            rules.required &&
            (value === undefined || value === null || value === '')
        ) {
            mistake = { code: 'e11', msg: `${label}不可为空`, msgEn: `${labelEn} Can't Be Empty` }
            // 中断循环，抛出错误
            break
        }

        // read: [list, detail, info, login...]
        // 查询接口 where 不需要空字符串参数
        // write: [add, edit, del...]
        // 写入接口 可以写入空字符串参数
        if (
            value === null ||
            value === undefined ||
            (value === '' && type === 'read')
        ) {
            // 进入下一循环
            continue
        }
        // else if (type === 'write') {
        // 不停止，值写入
        // }

        if (rules && value !== '') {
            // 判断字符长度
            if (
                (rules.max && value.length > rules.max) ||
                (rules.min && value.length < rules.min)
            ) {
                mistake = { code: 'e12', msg: `${label}长度不合规`, msgEn: `${labelEn} Length Is Not In Reason` }
                break
            }
            // 正则判断
            if (
                rules.reg && !rules.reg.test(value)
            ) {
                mistake = { code: 'e13', msg: `${label}格式不合规`, msgEn: `${labelEn} Format Is Not In Reason` }
                break
            }
        }
        // 值重组
        if (rename) {
            data[rename] = rewrite || value
        }
    }

    return { mistake, data }
}

const hasValue = (value) => {
    // false: undefined null String()
    // true: 0 false other
    return value !== undefined && value !== null && value !== ''
}

module.exports = {
    throwSuccess,
    throwError,
    checkPageAndRewrite,
    checkRuleAndfilterEmpty
}