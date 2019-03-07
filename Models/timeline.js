const { db } = require('../Schema/config')

const TimelineSchema = require('../Schema/timeline')
const Timeline = db.model("timelines", TimelineSchema)

module.exports = Timeline