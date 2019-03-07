const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
const Website = require('../Models/website')
const client = require('../util/myredis')
const Timeline = require('../Models/timeline')
const fs = require("fs");

//处理根路由
exports.getIndex = async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.readFile("views/01.html", "utf8", (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    }).then((data) => {
        ctx.body = data;
    }, err => console.log(err));
};
// 获取文章列表
exports.getList = async ctx => {
    // 查询每篇文章 分页
    // id ctx.params.id
    let page = ctx.params.id || 1
    page--   
    const maxNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num)   
    const artList = await Article
      .find()
      .sort('-created')
      .skip(10 * page)
      .limit(10)
      //拿到了10条数据
      .populate({
        path: "author",
        select: '_id username avatar'
      }) // mongoose 用于连表查询
      .then(data => data)
      .catch(err => console.log(err));
    //console.log(artList);
    let newList,hotList,randomList,commentList,webNum,linkList;
    newList = await Article
      .find()
      .sort('-created')
      .limit(5)
      .then(data => data)
      .catch(err => console.log(err));
    hotList = await Article
      .find()
      .sort({'readNum':-1})
      .limit(7)
      .then(data => data)
      .catch(err => console.log(err));
    randomList = await Article
      .aggregate([{$sample:{size:10}}])
      .then(data => data)
      .catch(err => console.log(err));
    loveList = await Article
      .find()
      .sort({'commentNum':-1})
      .limit(7)
      .then(data => data)
      .catch(err => console.log(err));
    commentList = await Comment
      .find()
      .sort("-created")
      .limit(7)
      .populate("from", "username avatar")
      .populate("article", "_id title")
      .then(data => data)
      .catch(err => {console.log(err)})
    // console.log(hotList)
    const userNum = await User.estimatedDocumentCount((err, num) => err? console.log(err) : num);
    const articleNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num);
    const commentNum = await Comment.estimatedDocumentCount((err, num) => err? console.log(err) : num);
    const website = await Website.find().sort("-created").limit(1).then(data => data).catch(err => {console.log(err)});
    const visitNum = website[0].visitNum;
    const tipsNum = website[0].tips.length;
    const tagsNum = website[0].tags.length;
    const updateTime = new Date(Math.max(website[0].created,commentList[0].created,newList[0].created)).toLocaleString();
    const duration = Math.floor((Date.now()-new Date(2018,11,05))/1000/3600/24)
    webNum = {userNum,articleNum,commentNum,visitNum,tipsNum,tagsNum,updateTime,duration};
    var isClick=[];
  // 设置过期时间 3s
  //redis.expire('test-redis-expire', 3)
  await new Promise((resolve, reject) => {
    var clickList = [];
    artList.forEach((item,index)=>{
      client.get(item._id,function (err,v) {
        if(err) console.log(err);
        if(v) {
          isClick = true;
          console.log(1,isClick);
        }else{
          isClick = false;
        }
        // client.quit();
        clickList.push({'isClick':isClick,'_id':v});
        resolve(clickList);
      });
    });
  })
    .then(data => {
      isClick = data
    })
    .catch(err => {
      console.log(err);
    }) 
    console.log(2,isClick)
    var users = ctx.cookies.get('username');
    await ctx.render("home", {
      session: ctx.session,
      title: '青丝梦思维-前端开发|关注互联网上的那些事',
      artList,
      maxNum,
      users,
      newList,
      hotList,
      randomList,
      loveList,
      commentList,
      webNum,
      isClick
    })
}
//特别推荐
exports.loveList = async (ctx) => {
  await new Promise((resolve, reject) => {
    //console.log(1,ctx.req.url);
    Article
        .find()
        .sort({'loveNum':-1})
        .limit(6)
        .then(data => resolve(data))
        .catch(err => console.log(err));
  }).then((data) => {
        //console.log(2,data);
        ctx.body = data;
  },err => console.log(err));
};
// 网站公告 博客简介
exports.notice = async (ctx) => {
  const notice = await Timeline
      .find()
      .sort("-created")
      .then(data => data[0])
      .catch(err => console.log(err));
  ctx.body = notice;
};
// 主页banner图
exports.banner = async (ctx) => {
  const bannerurl = await Website
      .find()
      .sort("-created")
      .then(data => data[0].banner)
      .catch(err => console.log(err));
  ctx.body = bannerurl;
};
//文章列表
exports.artList = async (ctx) => {
  let body=ctx.request.body,maxNum,artList;
  let page = ctx.params.id || 1;
  page--  ; 
  let limitCount = Number(body.limit) || 10;
  let tips = body.tips;
  let type = body.type;

  if(tips){
    artList = await Article
      .find({tips:tips})
      .sort('-created')
      .skip(limitCount * page)
      .limit(limitCount)
      .populate({
        path: "author",
        select: '_id username avatar'
      }) // mongoose 用于连表查询
      .then(data => data)
      .catch(err => console.log(err))
    maxNum = await Article
      .countDocuments({tips:tips});
  };
  if(type){
    artList = await Article
      .find({type:type})
      .sort('-created')
      .skip(limitCount * page)
      .limit(limitCount)
      .populate({
        path: "author",
        select: '_id username avatar'
      }) // mongoose 用于连表查询
      .then(data => data)
      .catch(err => console.log(err))
    maxNum = await Article
      .countDocuments({type:type});
  }
  if(!tips && !type){
    artList = await Article
      .find()
      .sort('-created')
      .skip(limitCount * page)
      .limit(limitCount)
      //拿到了10条数据
      .populate({
        path: "author",
        select: '_id username avatar'
      }) // mongoose 用于连表查询
      .then(data => data)
      .catch(err => console.log(err));
    maxNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  } 
  //console.log(page,"artList") 
  ctx.body = {maxNum,artList};
};
//案例作品列表
exports.worksList = async (ctx) => {
  let maxNum,artList;
  let page = ctx.params.id || 1
  page-- 
  let limitCount = Number(ctx.request.body.limit) || 10;
  artList = await Article
    .find({type:"works"})
    .sort('-created')
    .skip(limitCount * page)
    .limit(limitCount)
    .populate({
      path: "author",
      select: '_id username avatar'
    }) // mongoose 用于连表查询
    .then(data => data)
    .catch(err => console.log(err));
  maxNum = artList.length;
  //console.log(page,"artList") 
  ctx.body = {maxNum,artList};
};
//最近更新
exports.newList = async (ctx) => {
  const url = ctx.request.url;
  let type,newList;
  if(url.split("?")[1]) type = url.split("?")[1].split("=")[1];
  if(type){
    newList = await Article
      .find({type})
      .sort('-created')
      .limit(5)    
      .then(data => data)
      .catch(err => console.log(err));
  }else{
    newList = await Article
      .find()
      .sort('-created')
      .limit(5)    
      .then(data => data)
      .catch(err => console.log(err));
  }  
  ctx.body = newList;
};
 //热度排行
exports.hotList = async (ctx) => {
  const hotList = await Article
      .find()
      .sort({'readNum':-1})
      .limit(7)
      .populate({
        path: "author",
        select: 'avatar'
      }) // mongoose 用于连表查询
      .then(data => data)
      .catch(err => console.log(err));
  ctx.body = hotList;
};
 //随机文章
exports.randomList = async (ctx) => {
  let randomList = [];
  await Article
      .aggregate([{$sample:{size:10}}])    
      .then(async function (data){
        //console.log(data,data.length);
        randomList = await Article.populate(data, [{path: 'author',select: 'avatar'}]).then(data => data)
      })
      .catch(err => console.log(err));
  
  ctx.body = randomList;
};
 //精彩评论
exports.commentList = async (ctx) => {
  const commentList = await Comment
      .find()
      .sort("-created")
      .limit(7)
      .populate("from", "username avatar")
      .populate("article", "_id title")
      .then(data => data)
      .catch(err => console.log(err));
  ctx.body = commentList;
};
 //站点信息
exports.webList = async (ctx) => {
  const newList = await Article
      .find()
      .sort('-created')
      .limit(1)
      .then(data => data)
      .catch(err => console.log(err));
  const commentList = await Comment
      .find()
      .sort("-created")
      .limit(1)
      .then(data => data)
      .catch(err => {console.log(err)})
  const userNum = await User.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const articleNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const commentNum = await Comment.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const website = await Website.find().sort("-created").limit(1).then(data => data).catch(err => {console.log(err)});
  const visitNum = website[0].visitNum;
  const tipsNum = website[0].tips.length;
  const tagsNum = website[0].tags.length;
  const updateTime = new Date(Math.max(website[0].created,commentList[0].created,newList[0].created)).toLocaleString();
  const duration = Math.floor((Date.now()-new Date(2018,11,05))/1000/3600/24)
  const webNum = [articleNum,tipsNum,commentNum,userNum,tagsNum,duration,visitNum,updateTime];
  ctx.body = webNum;
};
// 站点文章纲目
exports.webOutline = async (ctx) => {
  const webList = await Website
                          .find()
                          .sort("-created")
                          .limit(1)
                          .then(data => data[0])
                          .catch(err => {console.log(err)});
  const webOutline = {
    typesList:webList.types,
    tipsList:webList.tips,
    tagsList:webList.tags
  }
  ctx.body = webOutline;
};
 //标签云
exports.tagsList = async (ctx) => {
  const tagsList = await Website
                          .find()
                          .sort("-created")
                          .limit(1)
                          .then(data => data[0].tags)
                          .catch(err => {console.log(err)});
  let len = tagsList.length;
  for (var i = 0; i < len - 1; i++) {
      var index = parseInt(Math.random() * (len - i));
      var temp = tagsList[index];
      tagsList[index] = tagsList[len - i - 1];
      tagsList[len - i - 1] = temp;
  }
  ctx.body = tagsList.slice(0,12);
};
 //tab选项 图片展示
exports.tabList = async (ctx) => {
  const tabList = await Article
      .find()
      .sort({'commentNum':-1})
      .limit(12)
      .then(data => data)
      .catch(err => console.log(err));
  ctx.body = tabList;
};