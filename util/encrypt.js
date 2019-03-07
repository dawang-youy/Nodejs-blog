const crypto = require('crypto')

// 加密对象 --》 返回加密成功的数据
module.exports = function(password, key = "****"){
  const hmac = crypto.createHmac("***", key)
  hmac.update(password)
  const passwordHmac = hmac.digest("***")
  return passwordHmac
}