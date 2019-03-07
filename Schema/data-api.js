const { Schema } = require('./config')

const DataApiSchema = new Schema({
  id:Number,
  title:String,
  content:String,
  tips: String,
  des: String,
}, {versionKey: false, timestamps: {
  createdAt: "created"
}})

module.exports = DataApiSchema