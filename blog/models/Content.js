let mongoose = require('mongoose');
let contentSchemas = require('../schemas/contents');

module.exports = mongoose.model('content',contentSchemas);
