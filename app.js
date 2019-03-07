const Koa = require('koa');
const router = require('./routers/routers');
const static = require('koa-static');
const views = require('koa-views');
const logger = require('koa-logger');
const body = require('koa-body');
const {join} = require('path');
const session = require('koa-session');
const compress = require('koa-compress');
//生成Koa实例
const app = new Koa;
//注册日志模块
app.use(logger());
// 资源压缩模块
app.use(compress({
    // filter: function (content_type) {
    //     return /text/i.test(content_type)
    // },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));
//签名密钥
app.keys = ["今晚打老虎"];
// session的配置对象
const CONFIG = {
    key: "Sid",
    maxAge: 36e5,
    overwrite: true,
    httpOnly: true,
    signed: true,

};
// 注册session
app.use(session(CONFIG,app));
// 配置koa-body 处理post 请求数据
app.use(body());
//配置静态资源目录
app.use(static(join(__dirname,"public")));
//配置视图模板
app.use(views(join(__dirname,"views"),{
    extension:"pug",
}));


//绑定路由对象 注册路由信息
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000,()=>{
    console.log("项目启动成功，监听在3000端口");
});
// 创建管理员用户 如果管理员用户存在则返回
{
    // admin admin
    const {db} = require('./Schema/config')
    const UserSchema = require('./Schema/user')
    const User = db.model("users",UserSchema)
    const encrypt = require('./util/encrypt')
    User
        .find({username:"admin"})
        .then(data => {
            if(data.length === 0){
                //管理员不存在 创建
                new User({
                    username:"admin",
                    password:encrypt("admin2019dawang"),
                    role:666,
                    commentNum:0,
                    articleNum:0
                })
                .save()
                .then(data => {
                    console.log(`管理员用户名 -> admin,  密码 -> admin`);
                })
                .catch(err => {
                    console.log("管理员账号创建失败！");
                })
            }else{
                //在控制台输出
                console.log(`管理员用户名 -> admin,  密码 -> admin`);
            }
        })

}