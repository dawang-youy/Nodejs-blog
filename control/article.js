// const Article = require('../Models/article')
// const User = require('../Models/user')
// const Comment = require('../Models/comment')
const {db} = require('../Schema/config')
const ArticleSchema = require('../Schema/article')
// 去用户的 Schema 为了拿到操作 users 集合的实例对象
const UserSchema = require('../Schema/user')
const User = db.model("users",UserSchema)
const Article = db.model("articles",ArticleSchema)
const CommentSchema = require('../Schema/comment.js')
const Comment = db.model("comments",CommentSchema)
const Website = require('../Models/website')
const client = require('../util/myredis')
const fs = require('fs')
//处理文章页路由
exports.getIndex = async (ctx, next) => {
  await new Promise((resolve, reject) => {
      fs.readFile("views/02.html", "utf8", (err, data) => {
          if (err) reject(err);
          resolve(data);
      });
  }).then((data) => {
      ctx.body = data;
  }, err => console.log(err));

  //控制权交给下一个中间件
  //await next();
};
// 返回文章发表页
exports.addPage = async (ctx) => {
  await new Promise((resolve, reject) => {
    fs.readFile("views/04.html", "utf8", (err, data) => {
        if (err) reject(err);
        resolve(data);
    });
  }).then((data) => {
      ctx.body = data;
  }, err => console.log(err));
}

// 文章的发表（保存到数据库）
exports.add = async ctx => {
  if(ctx.session.isNew){
    // true 就没登录   就不需要就查询数据库
    return ctx.body = {
      msg: "用户未登录",
      status: 0
    }
  }

  // 用户登录的情况：
  // 这是用户在登录情况下，post 发过来的数据
  const data = ctx.request.body
  let lengthNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num)
  data.id = lengthNum + 1
  // 添加文章的作者
  data.author = ctx.session.uid
  //data.author = ctx.session.username
  data.commentNum = 0
  data.loveNum = 0
  data.readNum = 0
  let num = Math.floor(Math.random()*(5.5))+1;
  if(!data.imgSrc) data.imgSrc = "/article/default/"+num+".jpg"
  await new Promise((resolve, reject) => {
    new Article(data).save((err, data) => {
      //console.log(data.author)
      if(err)return reject(err)
      // 更新用户文章计数
      //console.log(data);
      User.updateOne({_id: data.author}, {$inc: {articleNum: 1}}, err => {
        if(err)return console.log(err)
        console.log("文章保存成功")
      })
     
      //console.log(data.author)
      resolve(data)
    })
  })
  .then(data => {
    ctx.body = {
      msg: "发表成功",
      status: 1
    }
  })
  .catch(err => {
    ctx.body = {
      msg: "发表失败",
      status: 0
    }
  })
}

// 文章标题图片上传
exports.uploadimg = async ctx => {
  let _id = ctx.params.id
  const filename = ctx.req.file.filename
  //console.log("上传",_id,filename)
  let data = {}
  await Article.updateOne({_id}, {$set: {imgSrc: "/article/titleimg/" + filename}}, (err, res) => {
    if(err){
      data = {
        status: 0,
        message: "上传失败"
      }
    }else{
      data = {
        status: 1,
        message: '上传成功'
      }
    }
  })
  ctx.body =  data
}
// 获取文章列表
exports.getList = async ctx => {
  // 查询每篇文章对应的作者的头像
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
    .catch(err => console.log(err))
  //console.log(artList);
  let newList,hotList,randomList,commentList,webNum,linkList,loveList;
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
      .aggregate([{$sample: {size:10}}])
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
      .catch(err => {console.log(err)});
  const userNum = await User.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const articleNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const commentNum = await Comment.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  const website = await Website.find().sort("-created").limit(1).then(data => data).catch(err => {console.log(err)});
  const visitNum = website[0].visitNum;
  const tipsNum = website[0].tips.length;
  const tagsNum = website[0].tags.length;
  const updateTime = new Date(Math.max(website[0].created,commentList[0].created,newList[0].created)).toLocaleString();
  const duration = Math.floor((Date.now()-new Date(2018,11,05))/1000/3600/24)
  console.log(updateTime,duration)
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
  //console.log(2,isClick)
  var users = ctx.cookies.get('username');
  await ctx.render("index", {
    session: ctx.session,
    title: "关注前端开发-文章页|青丝梦思维博客",
    artList,
    maxNum,
    users,
    newList,
    hotList,
    randomList,
    commentList,
    loveList,
    webNum,
    isClick
  })
  // await ctx.render("index", {})
}
// tips 分页
// type 分页
// 文章点赞
exports.loveList = async (ctx,next) => {
  const data = ctx.request.body;
  //console.log(data);
  const {cip,href} = data;
  const _id = href;
  //console.log(_id,cip); 
  //console.log(2,loveNum);
  client.get(_id+cip,async function (err,v) {
    if(err) console.log(err);
    if(v) {
      console.log(1,v);
      //next();
    }else{
      client.set(_id+cip,'true',function(err,v){
        console.log('set',err,v);
      });
      client.expire(_id+cip,60*60*10,function(err,v){
        console.log('expire',err,v);
      });
      await new Promise((resolve, reject) => {
        Article.updateOne({_id: _id}, {$inc: {loveNum: 1}}, err => {
            if(err)return console.log(err)
            //console.log("成功点赞！")
          })
          resolve("点赞成功！")
      })
        .then(data => {
          console.log(data);
        })
        .catch(err => {
          console.log(err);
      })
      //console.log(cip);
    }
    //console.log("redis get"+ _id+cip +"err,v",err,v);
    // client.quit();
  });
  let loveNum = await Article
                .findById({_id:_id})
                .then(data => data.loveNum)
                .catch(err => {
                  console.log(2,err);
                });
  // console.log("lovelist",loveNum)
  //await next();
  ctx.body = loveNum;
} 
exports.artLove = async ctx => {
  const data = ctx.request.body;
  //console.log(data);
  const {cip,href} = data;
  const _id = href;
  let loveNum = await Article
                .findById({_id:_id})
                .then(data => data.loveNum)
                .catch(err => {
                  console.log(2,err);
                });
  console.log("artLove",loveNum)
  ctx.body = loveNum;
}
// 文章详情
exports.details = async ctx => {
  //console.log(ctx.request.url)
  // 去动态路由的里的 id
  const _id = ctx.params.id
  // 点开链接 浏览数+1
  await new Promise((resolve, reject) => {
    Article.updateOne({_id: _id}, {$inc: {readNum: 1}}, err => {
      if(err)return console.log(err)
    })
    resolve("浏览数加1！")
  })
  .then(data => {
    console.log(data);
    // data.tags = data.tags.split(";")
  })
  .catch(err => {
    console.log(err);
  })
  // console.log(article,pre,next)  
  await new Promise((resolve, reject) => {
    fs.readFile("views/03.html", "utf8", (err, data) => {
        if (err) reject(err);
          resolve(data);
      });
  }).then((data) => {
      ctx.body = data;
  }, err => console.log(err));
}
// 文章详情页 文章接口
exports.artDetail = async ctx => {
  const _id = ctx.params.id
  // 查找文章本身数据
  //console.log(3,_id);
  const article = await Article
    .findById(_id)
    .populate("author", "username")
    .then(data => data)
    .catch(err => {
      console.log(2,err);
    })
  //console.log(1,article);
  let pre=next=[];
  if(article.id){
    if(article.id-1){
      pre = await Article
        .find({id:article.id-1})
        .then(data => data)
    }
    if(article.id+1){
      next = await Article
        .find({id:article.id+1})
        .then(data => data)
    }
  } 
  // console.log(article,pre,next)
  ctx.body = {
              article,
              pre:(pre.length > 0)?[pre[0]._id,pre[0].title]:[],
              next:(next.length > 0)?[next[0]._id,next[0].title]:[]
            };
}
// 文章详情页 相关文章接口
exports.relateArt = async ctx => {
  const _id = ctx.params.id
  // 查找文章本身数据
  const article = await Article
    .findById(_id)
    .populate("author", "username")
    .then(data => data)
    .catch(err => {
      console.log(err);
    })
  //console.log(article);
  const relateList = await Article
        .find({type:article.type})
        .limit(10)
        .populate("author", "username")
        .then(data => data)
        .catch(err => console.log(err)); 
  let relateTitle = [],
      relateId = [];
  relateList.forEach(v=>{
    relateTitle.push(v.title);
    relateId.push(v._id);
  })
  ctx.body = {
    relateId,
    relateTitle
  };
}
// 文章详情页 对应文章评论接口
exports.relateComment = async ctx => {
  const _id = ctx.params.id
  // 查找跟当前文章关联的所有评论
  const comment = await Comment
    .find({article: _id})
    .sort("-created")
    .populate("from", "username avatar")
    .then(data => data)
    .catch(err => {
      console.log(err)
    })
  // console.log(article,pre,next)
  ctx.body = comment;
}
// 返回用户所有文章
exports.artlist = async ctx => {
  let page = ctx.params.id || 1
  page--
  const uid = ctx.session.uid
  const data = await Article
    .find({author: uid})
    .sort('-created')
    .skip(10 * page)
    .limit(10)
    .then(data => data)
    .catch(err => console.log(err))
  const count = await Article
    .find({author: uid})
    .then(data => data)
    .catch(err => console.log(err))
  ctx.body = {
    code: 0,
    maxNum:count.length,
    data
  }
}
// 添加文章 富文本编辑器图片接口
exports.upload = async ctx => {
  const filename = ctx.req.file.filename;
  //console.log(filename)
  const imgData = {
    "code": 0 //0表示成功，其它失败
    ,"msg": "上传成功" //提示信息 //一般上传失败后返回
    ,"data": {
      "src": "/upload/images/"+filename
      //,"title": "图片名称" //可选
    }
  }
  ctx.body =  imgData
}

// 删除对应 id 的文章
exports.del = async ctx => {
  const _id = ctx.params.id
  // 用户的 articleNum -1
  // 删除文章对应的所有的评论
  // 被删除评论对应的用户表里的  commentNum -1
  // 删除文章
  
  let res = {
    state: 1,
    message: "成功"
  }

  await Article.findById(_id)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })

  ctx.body = res
}