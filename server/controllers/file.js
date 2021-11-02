const fs = require('fs')
const uuid = require('node-uuid')
const path = require('path')
const { throwSuccess, throwError } = require('../common/response')

class FileController {
    static async upload(ctx) {
        try {
            const file = ctx.request.files.file
            const extName = file.name.substring(file.name.lastIndexOf('.'), file.name.length)
            if (['.jpg', '.jpeg', '.png', '.jfif'].indexOf(extName) === -1) {
                throwError(ctx, 'notMatch', { msg: '不支持' + extName + '格式的文件', msgEn: extName + 'Is Not Support' })
                return
            }

            if (file.size > 0.2 * 1024 * 1024) {
                throwError(ctx, 'outRange', { msg: '最大支持200KB大小的图片', msgEn: 'File Should Be Less Than 200KB' })
                return
            }

            const fileName = uuid.v4()
            const reader = fs.createReadStream(file.path)
            const stream = fs.createWriteStream(path.join('public/uploads/', fileName + extName))
            reader.pipe(stream)

            throwSuccess(ctx, {
                msg: '上传成功',
                msgEn: 'Upload Success',
                data: {
                    file: fileName + extName
                }
            })
        } catch (err) {
            throwError(ctx, 500)
        }
    }
}

module.exports = FileController
