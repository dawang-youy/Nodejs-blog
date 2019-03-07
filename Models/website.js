const { db } = require('../Schema/config')

const WebsiteSchema = require('../Schema/website')
const Website = db.model("websites", WebsiteSchema)

module.exports = Website