const path = require('path')
const fs = require('fs')

const UPLOAD_DIR = path.join(__dirname, '../uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR)
}

module.exports = { UPLOAD_DIR }