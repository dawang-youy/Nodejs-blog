const Router = require('koa-router');
const router = new Router;
const user = require('../control/user');//拿到操作user表的逻辑对象
const article = require('../control/article');
const comment = require('../control/comment');
const admin = require('../control/admin');
const diary = require('../control/diary');
const home = require('../control/home');
const upload = require('../util/upload');
const imgUpload = require('../util/imgupload');
const artImgUpload = require('../util/artimgupload');
const bannerImgUpload = require('../util/bannerimgupload');

router.get("/",user.keepLog,admin.count,home.getIndex)
//特别推荐
router.get("/api/lovelist/", home.loveList);
//网站公告接口
router.get("/api/notice/", home.notice);
//网站主页banner地址接口
router.get("/api/banner/", home.banner);
//文章列表
router.get("/api/artlist/:id", home.artList);
//案例作品列表
router.get("/api/works/:id", home.worksList);
//文章列表
router.post("/api/artlist/:id", home.artList);
//最近更新
router.get("/api/newlist", home.newList);
//热度排行
router.get("/api/hotlist", home.hotList);
//随机文章
router.get("/api/randomlist", home.randomList);
//精彩评论
router.get("/api/commentlist", home.commentList);
//站点信息
router.get("/api/weblist", home.webList);
//标签云
router.get("/api/tagslist", home.tagsList);
//tab 选项 图片
router.get("/api/tablist", home.tabList);
// 用户状态 接口
router.get("/api/user/state",user.userState);
// 站点文章纲目
router.get("/api/weboutline",home.webOutline);
// 数据接口
router.get("/dataapi/vue/:id",admin.getdata);
// 管理数据接口
router.get("/dataapi/get",user.keepLog,admin.getalldata);
// 删除数据接口
router.del("/dataapi/del/:id",user.keepLog,admin.datadel);
// 管理站点记事接口
router.get("/timeline/get",user.keepLog,admin.gettimeline);
// 删除站点记事
router.del("/timeline/del/:id",user.keepLog,admin.timelinedel);
router.get("/article", user.keepLog, admin.count,article.getIndex);
//主要用来处理返回  用户登录  用户注册
router.get("/user",user.keepLog,user.user);
router.get("/diary",user.keepLog,admin.count,diary.getList);
//注册用户
router.post("/user/reg",user.reg);
router.post("/user/login",user.login);
router.post("/user/change",user.change);
// 用户退出
router.post("/user/logout",user.logout);
// 搜索接口
router.get("/search/:id",user.keepLog,admin.search);
// 文章的发表页面
router.get('/article/add',user.keepLog,article.addPage);
// 文章的添加
router.post("/article/add",user.keepLog,article.add);
// 主页列表分页 路由
//router.get("/page/:id",user.keepLog,admin.count,home.getList)
// 文章列表分页 路由
//router.get("/article/page/:id",user.keepLog,admin.count,article.getList)
// 日记列表分页 路由
router.get("/diary/page/:id",user.keepLog,diary.getList);
// 文章的详情页 路由
router.get("/article/:id",user.keepLog,article.details);
// 文章详情页 文章接口
router.get("/api/article/:id",article.artDetail)
// 文章详情页 相关文章接口
router.get("/api/relateart/:id",article.relateArt)
// 文章详情页 对应文章评论接口
router.get("/api/artcomment/:id",article.relateComment)
// 文章tips分页 路由
//router.get("/article/tips/:id",article.tipsList)
// 文章type分页 路由
router.get("/index/type",admin.count,article.getIndex)
//router.get("/article/type/:id",admin.count,article.typeList)
// 文章点赞 接口
router.post("/article/love",article.loveList)
// 添加评论
router.post("/comment",user.keepLog,comment.save)
// 作品案例路由
router.get("/works/:id",admin.workcase)
// 作品案例主页路由
router.get("/workscase",user.keepLog,admin.count,admin.workscase)
// 寻觅足迹 路由
router.get("/find",user.keepLog,admin.count,admin.website)
// 寻觅足迹 分页路由
router.get("/find/page",user.keepLog,admin.page)
// 添加站点留言
router.post("/website/comment",user.keepLog,admin.save)
// 关于博客 路由
router.get("/about",user.keepLog,admin.count,admin.about)
// 动态dynamic 路由
router.get("/dynamic",user.keepLog,admin.count,admin.dynamic)
router.get("/dynamic/page",user.keepLog,admin.dynamicpage)
// 后台管理页面： 文章  评论 头像上传
router.get("/admin/:id",user.keepLog,admin.index)
// 后台编辑页面 上传信息
router.post("/admin/edit",user.keepLog,admin.createweb)
// 后台编辑数据接口
router.post("/dataapi/upload",user.keepLog,admin.createdata)
// 后台编辑站点记事接口
router.post("/timeline/upload",user.keepLog,admin.createtimeline)
// 头像上传功能
router.post("/upload",user.keepLog,upload.single("file"),user.upload)
// 获取用户的所有评论
router.get("/user/comments/",user.keepLog,admin.comment)
// 后台：删除用户评论
router.del("/comment/:id",user.keepLog,comment.del)
// 获取用户的所有文章
router.get("/user/articles/",user.keepLog,admin.article)
// 后台：删除用户文章
router.del("/article/:id",user.keepLog,article.del)
// 获取所有用户
router.get("/user/users/",user.keepLog,admin.user)
// 后台：删除用户
router.del("/user/:id",user.keepLog,user.del)
// 后台 更改用户权限
router.post("/user/changerole",user.keepLog,user.changerole)
// 发表文章 内容上传图片
router.post("/upload/images",user.keepLog,imgUpload.single("file"),article.upload)
// 发表文章 上传标题图片
router.post("/upload/articleimg/:id",user.keepLog,artImgUpload.single("file"),article.uploadimg)
// 后台 上传banner图片
router.post("/upload/banner/image",user.keepLog,bannerImgUpload.single("file"),admin.uploadbanner)
router.get("*",async ctx => {
    await ctx.render("404",{
        title:"404"
    })
})

module.exports = router