const mongoose = require('mongoose');
const { orderSchema } = require('../schemas');

module.exports = mongoose.model('order', orderSchema);
