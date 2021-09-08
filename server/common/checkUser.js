const jwt = require('jsonwebtoken')
const { token } = require('../../config')

const { UserModel } = require('../model')
const { throwError } = require('../common/response')

const isMaster = async (ctx) => {
    const Authorization = ctx.request.headers.authorization.replace('Bearer ', '')
    const userId = await jwt.verify(Authorization, token.key).id
    const userInfo = await UserModel.info(userId)
    if (!userInfo) {
        throwError(ctx, 401)
        return false
    }
    if (userInfo.permissionLevel !== 0) {
        throwError(ctx, 403)
        return false
    }
    return true
}

module.exports = {
    isMaster
}