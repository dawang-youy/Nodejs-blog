const { db } = require('../Schema/config')

const DataApiSchema = require('../Schema/data-api')
const DataApi = db.model("dataapis", DataApiSchema)

module.exports = DataApi