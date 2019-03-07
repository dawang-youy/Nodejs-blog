var redis = require('redis'),
      RDS_PORT = 6379,
      RDS_HOST = '127.0.0.1',
      RDS_PWD = '12345',
      RDS_OPTS = {auth_pass:RDS_PWD};
var client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
module.exports = client