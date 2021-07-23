const jwt = require('jsonwebtoken')
const { throwError } = require('../server/common/response')

const sign = 'token'
const check = function () {
    return async function (ctx, next) {
        try {
            const token = ctx.request.headers[sign]
            if (token) {
                console.log(token, sign)
                const result = jwt.verify(token, sign)
                console.log(result)
                const data = new Date().getTime() / 1000
                if (data <= result.exp) {
                    await next()
                } else {
                    throwError(ctx, 405)
                }
            } else {
                throwError(ctx, 401)
            }
        } catch (err) {
            if (err.status === 401) {
                throwError(ctx, 401)
            } else if (err.status === 404) {
                throwError(ctx, 404)
            }
        }
    }
}

module.exports = {
    sign,
    check
}
