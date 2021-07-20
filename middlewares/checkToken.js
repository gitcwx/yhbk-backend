const jwt = require('jsonwebtoken')
const jwtSecret = 'token'

module.exports = function () {
    return async function check(ctx, next) {
        const url = ctx.url.split('?')[0]

        const token = ctx.request.headers.token
        // let token = jwt.sign(
        //   { name: "test", id: "123456" }, // 加密userToken
        //   jwtSecret,
        //   { expiresIn: "1h" }
        // );
        // console.log(token)
        if (token) {
            const result = jwt.verify(token, 'token')
            const data = new Date().getTime() / 1000
            if (data <= result.exp) {
                await next()
            } else {
                ctx.body = {
                    status: 405,
                    message: 'token 已过期，请重新登陆'
                }
            }
        }
    }
}
