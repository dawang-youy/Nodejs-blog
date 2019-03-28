const multer = require('koa-multer')
const { join } = require('path')

const storage = multer.diskStorage({
  // 存储的位置
  destination: join(__dirname, "../public/article/titleimg"),
  // 文件名
  filename(req, file, cb){
    const filename = file.originalname.split(".")
    //console.log(req.headers.cookie.split("=")[1].split(";"))
    cb(null, `${req.headers.cookie.split("=")[1].split(";")[0]}${Date.now()}.${filename[filename.length - 1]}`)
  }
})
//console.log(multer({storage}).single("file"))
module.exports = multer({storage})