const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId

const WebsiteSchema = new Schema({
  id:Number,
  visitNum:Number,
  types:Array,
  tags: Array,
  tips: Array,
  notice: String,
  gambit:String,
  banner: Array,
  recomment:Array,
}, {versionKey: false, timestamps: {
  createdAt: "created"
}})


WebsiteSchema.post('remove', doc => {
  const Comment = require('../Models/comment')
  const User = require('../Models/user')

  const { _id:artId, author: authorId } = doc

  // 只需要用户的 articleNum -1
  User.findByIdAndUpdate(authorId, {$inc: {articleNum: -1}}).exec()
  // 把当前需要删除的文章所关联的所有评论  一次调用 评论 remove
  Comment.find({article: artId})
    .then(data => {
      data.forEach(v => v.remove())
    })
})


module.exports = WebsiteSchema