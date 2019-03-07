// const Article = require('../Models/article')
// const User = require('../Models/user')
// const Comment = require('../Models/comment')
const {db} = require('../Schema/config')
const ArticleSchema = require('../Schema/article')
const Article = db.model("articles",ArticleSchema)
// 去用户的 Schema 为了拿到操作 users 集合的实例对象
const UserSchema = require('../Schema/user')
const User = db.model("users",UserSchema)
const CommentSchema = require('../Schema/comment.js')
const Comment = db.model("comments",CommentSchema)
// 保存评论
exports.save = async ctx => {
  let message = {
    status: 0,
    msg: "登录才能发表"
  }
  // 验证用户是否登录
  if(ctx.session.isNew)return ctx.body = message

  // 用户登录了。
  const data = ctx.request.body

  data.from = ctx.session.uid
  //console.log("comment",data);
  const _comment = new Comment(data)
  //console.log(data)
  await _comment
    .save()
    .then(data => {
      message = {
        status: 1,
        msg: '评论成功'
      }
      
      // 更新当前文章的评论计数器
      Article.updateOne({_id: data.article}, {$inc: {commentNum: 1}}, err => {
          if(err)return console.log(err)
          console.log("评论计数器更新成功")
        })

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

// 删除对应 id 的评论
exports.del = async ctx => {
  // 评论 id
  const commentId = ctx.params.id
  // 拿到 commentID   删除 comment ，
  // const articleId = ctx.request.body.articleId
  // const uid = ctx.session.uid
  // let isOk = true
  // // 让文章的计数器-1
  // await Article.update({_id : articleId},{$inc: {commentNum: -1}})
  // await User.update({_id : uid},{$inc:{commentNum: -1}})
  // // 删除评论
  // await Comment.deleteOne({_id: commentId}, err => {
  //   if(err)isOk = false
  // })
  // if(isOk){
  //   ctx.body = {
  //     state : 1,
  //     message : "删除成功"
  //   }
  // }
  let res = {
    state: 1,
    message: "成功"
  }

  await Comment.findById(commentId)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })

  ctx.body = res
} 