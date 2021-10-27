const mongoose = require('../../srvr/node_modules/mongoose');
const Schema = mongoose.Schema;

// Shop Schema
const ShopSchema = mongoose.Schema({
    shopName: { type: String, required: true, unique: true },
    active: { type: Boolean, required: true }
});

module.exports = shopModel = mongoose.model('shopModel', ShopSchema);