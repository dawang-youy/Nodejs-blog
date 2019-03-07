const { Schema } = require('./config')

const TimelineSchema = new Schema({
  id:String,
  title:String,
  notes:String,
  intro:String
}, {versionKey: false, timestamps: {
  createdAt: "created"
}})

module.exports = TimelineSchema