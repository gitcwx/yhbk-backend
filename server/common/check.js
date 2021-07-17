module.exports =  {
    table: (params) => {
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
    input (value, reg) {
        // 判断非空
        if (
            !value || !value.length
        ) {
            return { code: 'e11', msg: '输入不可为空' }
        }
        // 正则判断
    },
    success: {
        status: 200, 
        code: '00'
    },
    errors: {
        status: 900,
        code: 'e99',
        msg: '未知错误'
    }
}