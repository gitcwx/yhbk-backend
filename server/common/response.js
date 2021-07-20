// 服务器状态码
const status = {
    200: 'success',
    500: '服务器内部错误'
}
// 业务相应码
const codes = {
    '00': '成功',
    
    // 表格 页码 排序等规则判断
    'e01': '页码不合规',
    'e02': '每页显示条数不合规',
    'e03': '排序规则不合规',
    'e04': '排序字段不存在',

    // 输入
    'e11': '不可为空',
    'e12': '长度不合规',
    'e13': '格式不合规',

    // 数据查找
    'e21': '存在相同数据',
    'e22': '该数据不存在',
    'e23': '数据不匹配',

    // 服务器内部错误
    'e99': '服务器内部错误'
}

// 返回成功
const throwSuccess = (ctx, params) => {
    ctx.response.status = 200
    ctx.body = {
        code: '00',
        msg: null,
        data: null,
        ...params
    }
}

// 返回错误
const throwError = (ctx, type, params) => {
    let result = {}

    switch (type) {
        // 规则错误
        case 'rules': result = { status: 200, code: params.code, msg: params.msg }; break
        // 数据库存在相同数据
        case 'isExist': result = { status: 200, code: 'e21', msg: params.msg }; break
        // 不存在该数据
        case 'notExist': result = { status: 200, code: 'e22', msg: params.msg }; break
        // 数据不匹配
        case 'notMatch': result = { status: 200, code: 'e23', msg: params.msg }; break
        // 其他默认500
        case 500:  result = { status: 500, code: 'e99', msg: '服务器内部错误' };
    }

    ctx.response.status = result.status
    ctx.body = {
        code: result.code,
        msg: result.msg
    }
}

const checkRules = {
    list: (params) => {
        // 判断页码 page
        if (
            // false [null, 0, NaN, -Number]
            // true  [undefined, '', +inter]
            params.page !== undefined && !/^$|^[1-9]\d{0,2}$/.test(params.page)
        ) {
            return { code: 'e01', msg: '页码不合规' }
        }

        // 判断每页条数 limit
        if (
            // false [null, 0, NaN, -Number]
            // true  [undefined, '', +inter]
            params.limit !== undefined && !/^$|^[1-9]\d{0,2}$/.test(params.limit)
        ) {
            return { code: 'e02', msg: '每页显示条数不合规' }
        }

        // 判断排序规则
        if (
            // false  [other]
            // true   [undefined, '', 'asc'/i, 'desc'/i]
            params.orderby !== undefined && !/^$|^(de|a)sc$/i.test(params.orderby)
        ) {
            return { code: 'e03', msg: '排序规则不合规' }
        }

        // 判断排序字段是否为表中字段

        return undefined
    },
    inputs (data) {
        let result = undefined
        for (let i=0;i<data.length;i++) {
            const msgLabel = data[i].msgLabel
            const value = data[i].value
            const rules = data[i].rules
            
            // 判断非空
            if (
                !value && rules.required
            ) {
                result = { code: 'e11', msg: `${msgLabel}不可为空` }
                break
            }
            
            // 判断字符长度
            if (
                value !== undefined && (
                rules.max && value.length > rules.max || 
                rules.min && value.length < rules.min
                )
            ) {
                result = { code: 'e12', msg: `${msgLabel}长度不合规` }
                break
            }

            // 正则判断
            if (
                rules.reg && !rules.reg.test(value)
            ) {
                result = { code: 'e13', msg: `${msgLabel}格式不合规` }
                break
            }
        }
        
        return result
    }
}
module.exports =  {
    throwSuccess,
    throwError,
    checkRules
}