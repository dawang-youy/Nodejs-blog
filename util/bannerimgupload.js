const multer = require('koa-multer')
const { join } = require('path')

const storage = multer.diskStorage({
  // 存储的位置
  destination: join(__dirname, "../public/banner/image"),
  // 文件名
  filename(req, file, cb){
    const filename = file.originalname.split(".")
    //console.log(req.headers.cookie.split("=")[1].split(";"))
    cb(null, `${"banner"}${Date.now()}.${filename[filename.length - 1]}`)
  }
})
module.exports = multer({storage})