const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
const Website = require('../Models/website')
const Dataapi = require('../Models/dataapi')
const Timeline = require('../Models/timeline')
const client = require('../util/myredis')
const fs = require('fs')
const { join } = require('path')

exports.index = async ctx => {
  if(ctx.session.isNew){
    // 没有登录
    ctx.status = 404
    // return await ctx.render("404", {title: "404",result:"用户未登录"})
    await ctx.redirect("/user")
  }
  const id = ctx.params.id
  // console.log(id)
  // console.log(typeof id)
  const arr = fs.readdirSync(join(__dirname, "../views/admin"))
  let flag = false
  arr.forEach(v => {
    const name = v.replace(/^(admin\-)|(\.pug)$/g, "")
    if(name === id){
      flag = true
    }
  })
  if(flag){
    await ctx.render("./admin/admin-" + id, {
      role: ctx.session.role,
      username:ctx.session.username
    })
  }else{
    ctx.status = 404
    await ctx.render("404", {title: '404',result:"抱歉，页面未找到"})
  }
}
// 返回所有用户
exports.user = async ctx => {
  let page = ctx.req.url.split("?")[1].split("&")[0].split("=")[1] || 1
  page--
  const data = await User
    .find()
    .skip(10 * page)
    .limit(10)
    .then(data => data)
    .catch(err => console.log(err))
  const count = await User
    .find()
    .then(data => data)
    .catch(err => console.log(err))
  ctx.body = {
      code: 0,
      count:count.length,
      data
    }
}
// 返回用户所有文章
exports.article = async ctx => {
  let page = ctx.req.url.split("?")[1].split("&")[0].split("=")[1] || 1
  page--
  const uid = ctx.session.uid
  const data = await Article
    .find()
    .sort('-created')
    .skip(10 * page)
    .limit(10)
    .populate({
      path: "author",
      select: 'username'
    })
    .then(data => data)
    .catch(err => console.log(err))
  const count = await Article
    .find()
    .then(data => data)
    .catch(err => console.log(err))
  ctx.body = {
      code: 0,
      count:count.length,
      data
    }
}
// 后台： 查询用户所有评论
exports.comment = async ctx => {
  const uid = ctx.session.uid;
  const username = ctx.session.username;
  let data = [],count = 0;
  let page = ctx.req.url.split("?")[1].split("&")[0].split("=")[1] || 1;
  page--;
  if(username === "admin" || username === "dawang"){
    data = await Comment
      .find()
      .sort('-created')
      .skip(10 * page)
      .limit(10)
      .populate("from article", "username title")
      .then(data => data)
      .catch(err => console.log(err));
    count = await Comment.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  }else{
    data = await Comment
      .find({from:uid})
      .sort('-created')
      .skip(10 * page)
      .limit(10)
      .populate("from article", "username title")
      .then(data => data)
      .catch(err => console.log(err));
    count = await Comment.countDocuments({from:uid});
  } 
  ctx.body = {
      code: 0,
      count,
      data
    }
}
// 站点留言
exports.save = async ctx => {
  let message = {
    status: 0,
    msg: "登录才能留言！"
  }
  // 验证用户是否登录
  if(ctx.session.isNew)return ctx.body = message

  // 用户登录了。
  const data = ctx.request.body

  data.from = ctx.session.uid

  const _comment = new Comment(data)
  //console.log(data)
  await _comment
    .save()
    .then(data => {
      message = {
        status: 1,
        msg: '成功留下脚印！'
      }
      // 更新用户的评论计数器
      User.updateOne({_id: data.from}, {$inc: {commentNum: 1}}, err => {
        if(err) return console.log(err)
      })
    })
    .catch(err => {
      message = {
        status: 0,
        msg: err
      }
    })
  ctx.body = message
}
exports.website = async ctx => {
  //console.log(ctx.req.url)
  // 查找站点的所有留言
  var users = ctx.cookies.get('username');
  const maxNum = await Comment.countDocuments({type:"websites"});
  //console.log(maxNum);
  await ctx.render("findfootprint",{
    title:"关于&留言-青丝梦思维|关注前端技术博客",
    session: ctx.session,
    users,
    maxNum
  })
}
exports.page = async ctx => {
  //console.log(ctx.req.url)
  let page = ctx.req.url.split("?")[1].split("=")[1] || 0
  //console.log(page)
  const comment = await Comment
    .find({type:"websites"})
    .sort("-created")
    .skip(page * 5)
    .limit(5)
    .populate("from", "username avatar")
    .then(data => data)
    .catch(err => {
      console.log(err)
    })
  ctx.body = comment
}
exports.workcase = async ctx => {
  let index = ctx.params.id
  await new Promise((resolve, reject) => {
    fs.readFile("views/"+index, "utf8", (err, data) => {
        if (err) reject(err);
        resolve(data);
    });
  }).then((data) => {
      ctx.body = data;
  }, err => console.log(err));
}
exports.workscase = async ctx => {
  await new Promise((resolve, reject) => {
    fs.readFile("views/works.html", "utf8", (err, data) => {
        if (err) reject(err);
        resolve(data);
    });
  }).then((data) => {
      ctx.body = data;
  }, err => console.log(err));
}
exports.about = async ctx => {
  var users = ctx.cookies.get('username');
  //console.log(ctx.session);
  
  await ctx.render("about",{
    title:"点点滴滴，当思来之不易-青丝梦思维|博客",
    session: ctx.session,
    users,
  })
}
exports.dynamic = async ctx => {
  let users = ctx.cookies.get('username');
  let timeline = await Timeline
                        .find()
                        .sort("-created")
                        .then(data => data[0])
                        .catch(err => {
                          console.log(err)
                        });
  let userAvatar = await User
                        .find({username:"admin"})
                        .then(data => data[0].avatar)
                        .catch(err => {
                          console.log(err)
                        });
  let maxNum = await Timeline.estimatedDocumentCount((err, num) => err? console.log(err) : num)
  await ctx.render("dynamic",{
    title:"博客动态-青丝梦思维|博客",
    session: ctx.session,
    users,
    timeline,
    maxNum,
    userAvatar
  })
}
exports.dynamicpage = async ctx => {
  let page = ctx.req.url.split("?")[1].split("=")[1] || 0;
  //let uid = ctx.session.uid;
  let timeline = await Timeline
                        .find()
                        .sort("-created")
                        .skip(page * 5)
                        .limit(5)
                        .then(data => data)
                        .catch(err => {
                          console.log(err)
                        });
  let userAvatar = await User
                        .find({username:"admin"})
                        .then(data => data[0].avatar)
                        .catch(err => {
                          console.log(err)
                        });
  ctx.body = {
    timeline,
    userAvatar
  };
}
exports.createweb = async ctx => {
  if(ctx.session.isNew){
    // true 就没登录   就不需要就查询数据库
    return ctx.body = {
      msg: "用户未登录",
      status: 0
    }
  }
  // 用户登录的情况：
  // 这是用户在登录情况下，post 发过来的数据
  const data = ctx.request.body;
  let lengthNum = await Website.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  let visitNum = await Website
                        .find()
                        .sort("-created")
                        .then(data => data[0].visitNum)
                        .catch(err => {
                          console.log(err)
                        });
  data.id = lengthNum ? lengthNum + 1 : 0;
  data.visitNum = visitNum ? visitNum : 0;
  //console.log(data.visitNum);
  //data.tags = [];
  //data.tips = [];
  // data.gambit = "";
  // data.banner = [];
  // data.recomment = [];
  //console.log("data",data);
  await new Promise((resolve, reject) => {
    new Website(data).save((err, data) => {
      if(err)return reject(err)
      resolve(data)
    })
  })
  .then(data => {
    //console.log(data)
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
// 后台 banner图片上传
exports.uploadbanner = async ctx => {
  const filename = ctx.req.file.filename
  //console.log("上传",filename)
  let data = {}
  let website = await Website
        .find()
        .sort('-created')
        .limit(1)
        .then(data => data[0])
        .catch(err => {
          console.log(err)
        });
  let banner = website.banner;
  let _id = website._id;  
  if(banner[0] === "") banner.splice(0,1);
  banner.push("/banner/image/"+filename);
  if(banner.length > 6) banner.splice(0,banner.length-6);
  //console.log(banner);
  await Website.updateOne({_id}, {$set: {banner:banner}}, (err, res) => {
    //console.log(res);
    if(err){
      //console.log(err)
      data = {
        "code": 1 //0表示成功，其它失败
        ,"msg": "上传失败" //提示信息 //一般上传失败后返回
        ,"data": {
          "src": "/banner/image/"+filename
        }
      }
    }else{
      data = {
        "code": 0 //0表示成功，其它失败
        ,"msg": "上传成功" //提示信息 //一般上传失败后返回
        ,"data": {
          "src": "/banner/image/"+filename
          //,"title": "图片名称" //可选
        }
      }
    }
  })
  ctx.body =  data
}
exports.createdata = async ctx => {
  if(ctx.session.isNew){
    // true 就没登录   就不需要就查询数据库
    return ctx.body = {
      msg: "用户未登录",
      status: 0
    }
  }
  // 用户登录的情况：
  // 这是用户在登录情况下，post 发过来的数据
  const data = ctx.request.body;
  let lengthNum = await Dataapi.estimatedDocumentCount((err, num) => err? console.log(err) : num);
  data.id = lengthNum ? lengthNum + 1 : 1;
  //console.log(data);
  await new Promise((resolve, reject) => {
    new Dataapi(data).save((err, data) => {
      if(err)return reject(err)
      resolve(data)
    })
  })
  .then(data => {
    console.log(data)
    ctx.body = {
      msg: "保存成功",
      status: 1
    }
  })
  .catch(err => {
    ctx.body = {
      msg: "保存失败",
      status: 0
    }
  })
}
// 创建站点记事
exports.createtimeline = async ctx => {
  if(ctx.session.isNew){
    // true 就没登录   就不需要就查询数据库
    return ctx.body = {
      msg: "用户未登录",
      status: 0
    }
  }
  // 用户登录的情况：
  // 这是用户在登录情况下，post 发过来的数据
  const data = ctx.request.body;
  //console.log(data);
  await new Promise((resolve, reject) => {
    new Timeline(data).save((err, data) => {
      if(err)return reject(err)
      resolve(data)
    })
  })
  .then(data => {
    console.log(data)
    ctx.body = {
      msg: "保存成功",
      status: 1
    }
  })
  .catch(err => {
    ctx.body = {
      msg: "保存失败",
      status: 0
    }
  })
}
// 返回数据接口数据
exports.getdata = async ctx => {
  let title = ctx.params.id   

  const data = await Dataapi
    .find({title})
    .then(data => data[0].content)
    .catch(err => console.log(err));
  //console.log('getdata1',ctx.res)
  ctx.response.header={"Access-Control-Allow-Origin": "*"};
  //console.log('getdata2',ctx.res.header)
  // ctx.response.header = 
  ctx.body = data;
}
exports.getalldata = async ctx => {
  let page = ctx.req.url.split("?")[1].split("&")[0].split("=")[1] || 1
  page--
  //const uid = ctx.session.uid
  const data = await Dataapi
    .find()
    .sort('-created')
    .skip(10 * page)
    .limit(10)
    .then(data => data)
    .catch(err => console.log(err))
  const count = await Dataapi
    .find()
    .then(data => data)
    .catch(err => console.log(err))
  ctx.body = {
      code: 0,
      count:count.length,
      data
    }
}
exports.gettimeline = async ctx => {
  let page = ctx.req.url.split("?")[1].split("&")[0].split("=")[1] || 1
  page--
  //const uid = ctx.session.uid
  const data = await Timeline
    .find()
    .sort('-created')
    .skip(10 * page)
    .limit(10)
    .then(data => data)
    .catch(err => console.log(err))
  const count = await Timeline
    .find()
    .then(data => data)
    .catch(err => console.log(err))
  ctx.body = {
      code: 0,
      count:count.length,
      data
    }
}
// 删除对应 id 的数据
exports.datadel = async ctx => {
  const _id = ctx.params.id
  let res = {
    state: 1,
    message: "成功"
  }

  await Dataapi.findById(_id)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })

  ctx.body = res
}
// 删除对应 id 的记事
exports.timelinedel = async ctx => {
  const _id = ctx.params.id
  let res = {
    state: 1,
    message: "成功"
  }

  await Timeline.findById(_id)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })

  ctx.body = res
}
// 搜索功能
exports.search = async ctx => {
  let option = ctx.request.url.split("?")[1];
  let target='',artList=[],maxNum=0;
  if(option) {
    target = option.split("=")[1];
    //console.log(target);
    if(target){
      let type = decodeURI(target.trim());
      //console.log("type",type);
      let page = ctx.params.id || 1;
      page-- ;
      artList = await Article
        .find({$or:[{content:{$regex:type}},{title:{$regex:type}},{des:{$regex:type}}]})
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

      maxNum = await Article
        .countDocuments({$or:[{content:{$regex:type}},{title:{$regex:type}},{des:{$regex:type}}]});
      //console.log(maxNum);
    }
  }
  let newList,hotList,randomList,commentList,webNum,loveList;
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
  //console.log(updateTime,duration)
  webNum = {userNum,articleNum,commentNum,visitNum,tipsNum,tagsNum,updateTime,duration};
  //console.log(artList)
  let users = ctx.cookies.get('username');
  await ctx.render("search", {
    session: ctx.session,
    title: "关于”"+decodeURI(target)+"“的文章|青丝梦思维博客",
    artList,
    maxNum,
    users,
    newList,
    hotList,
    randomList,
    commentList,
    loveList,
    webNum,
    option:decodeURI(target)
  })
}
// 访问计数
exports.count = async (ctx, next) => {
  //console.log(ctx.req.url)
  let website = await Website
  .find()
  .sort('-created')
  .limit(1)
  .then(data => data[0])
  .catch(err => {
    console.log(err)
  });
  if(website){
    let _id = website._id;  
    await Website.updateOne({_id}, {$inc: {visitNum: 1}}, (err,mes) => {
      if(err)return console.log(err)
      //console.log(mes)
      //console.log("访问计数器更新成功")
    })
  } 
  await next()
}