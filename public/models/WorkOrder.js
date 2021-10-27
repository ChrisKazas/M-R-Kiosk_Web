const mongoose = require('../../srvr/node_modules/mongoose');
const Schema = mongoose.Schema;

let workOrderSchema = mongoose.Schema({
    mechanicID: { type: mongoose.Schema.Types.ObjectId, required: false },
    shopID: { type: mongoose.Schema.Types.ObjectId, required: false },
    pri: { type: String, required: true },
    dateOpened: { type: Date, required: true },
    dateClosed: { type: Date, required: false },
    workTodo: { type: String, required: false },
    workDone: { type: String, required: false },
    woID: { type: String, required: false }
});

module.exports = workOrderModel = mongoose.model('workOrderModel', workOrderSchema);