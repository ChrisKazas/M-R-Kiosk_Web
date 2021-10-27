const mongoose = require('../../srvr/node_modules/mongoose');
const Schema = mongoose.Schema;

let mechanicSchema = mongoose.Schema({
    mechanicName: { type: String, required: true, unique: true },
    active: { type: Boolean, required: true }
});

module.exports = mechModel = mongoose.model('mechModel', mechanicSchema);