const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
const Website = require('../Models/website')
const client = require('../util/myredis')
// 获取文章列表
exports.getList = async ctx => {
  // 查询每篇文章对应的作者的头像
  // id ctx.params.id
  let page = ctx.params.id || 1
  page--
  const artList = await Article
  .find({type:'diary'})
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
  webNum = {userNum,articleNum,commentNum,visitNum,tipsNum,tagsNum,updateTime,duration};
  const maxNum = artList.length;
  // var isClick=[];
  // // 设置过期时间 3s
  // //redis.expire('test-redis-expire', 3)
  // await new Promise((resolve, reject) => {
  //   var clickList = [];
  //   artList.forEach((item,index)=>{
  //     client.get(item._id,function (err,v) {
  //       if(err) console.log(err);
  //       if(v) {
  //         isClick = true;
  //         console.log(1,isClick);
  //       }else{
  //         isClick = false;
  //       }
  //       // client.quit();
  //       clickList.push({'isClick':isClick,'_id':v});
  //       resolve(clickList);
  //     });
  //   });
  // })
  // .then(data => {
  //   isClick = data
  // })
  // .catch(err => {
  //   console.log(err);
  // }) 
  // console.log(2,isClick)
  var users = ctx.cookies.get('username');
  await ctx.render("diary", {
    session: ctx.session,
    title: "博客日记-记录点滴",
    artList,
    maxNum,
    users,newList,hotList,randomList,commentList,webNum,loveList
  })
}