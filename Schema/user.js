const { Schema } = require('./config')

const UserSchema = new Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: 1
  },
  avatar: {
    type: String,
    default: "/avatar/default.jpg"
  },
  articleNum: Number,
  commentNum: Number
}, {versionKey: false})


UserSchema.post('remove', doc => {
  const Comment = require('../Models/comment')
  const Article = require('../Models/article')

  const { _id:artId, author: authorId } = doc
  // 把当前需要删除用户所关联的所有文章  一次调用 文章 remove
  Article.find({author: authorId})
    .then(data => {
      data.forEach(v => v.remove())
    })
  // 把当前需要删除用户所关联的所有评论  一次调用 评论 remove
  Comment.find({article: artId})
    .then(data => {
      data.forEach(v => v.remove())
    })
})

module.exports = UserSchema