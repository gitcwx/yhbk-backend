// MD5加盐加密
const md5 = require('js-md5')
const uuid = require('node-uuid')

module.exports = {
    UUID: uuid.v4,
    MD5: (value, salt) => {
        console.log(value, salt)
        return new Promise((resolve, reject) => {
            console.log(value, salt)
            const result = md5(md5(value) + salt)
            resolve(result)
        })
    }
}
